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
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-finished'], onTouchTap: function onTouchTap() {
                            _this2.clear('loaded');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-failed'], onTouchTap: function onTouchTap() {
                            _this2.clear('error');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: msg['html_uploader.clear-all'], onTouchTap: function onTouchTap() {
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
                        _react2.default.createElement(_materialUi.FlatButton, { label: pydio.MessageHash[54], onTouchTap: this.cancel.bind(this) }),
                        _react2.default.createElement(_materialUi.RaisedButton, { primary: true, label: pydio.MessageHash[48], onTouchTap: this.submit.bind(this) })
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
                    _react2.default.createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical", primary: true, iconStyle: { fontSize: 18 }, style: { padding: 14 }, tooltip: messages['html_uploader.options'], onTouchTap: this.toggleOptions.bind(this) }),
                    _react2.default.createElement('span', { style: { flex: 1 } }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-play' }), label: messages['html_uploader.start'], onTouchTap: this.start.bind(this), primary: true, disabled: store.isRunning() || !store.hasQueue() }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-pause' }), label: messages['html_uploader.pause'], onTouchTap: this.pause.bind(this), primary: true, disabled: !store.isRunning() }),
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-delete' }), label: _react2.default.createElement(
                            'span',
                            null,
                            messages['html_uploader.clear'],
                            _react2.default.createElement('span', { className: "mdi mdi-menu-down" })
                        ), onTouchTap: this.openClear.bind(this), primary: true, disabled: listEmpty }),
                    showDismiss && _react2.default.createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-close", style: { padding: 14 }, onTouchTap: function onTouchTap() {
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
                pgColor = void 0,
                errMessage = void 0;

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

            if (status === 'error' && item.getErrorMessage()) {
                errMessage = _react2.default.createElement(
                    'span',
                    { style: styles.errMessage, title: item.getErrorMessage() },
                    item.getErrorMessage()
                );
            }
            var statusLabel = void 0;
            var itemType = isDir ? "dir" : isPart ? "part" : "file";
            if (status === 'error') {
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
                            { style: styles.secondaryLine },
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9tb2RlbC9TdGF0dXNJdGVtLmpzIiwianMvYnVpbGQvdmlldy9DbGVhck9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9Db25maXJtRXhpc3RzLmpzIiwianMvYnVpbGQvdmlldy9Ecm9wVXBsb2FkZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyLmpzIiwianMvYnVpbGQvdmlldy9UcmFuc2ZlcnNMaXN0LmpzIiwianMvYnVpbGQvdmlldy9VcGxvYWRPcHRpb25zUGFuZS5qcyIsImpzL2J1aWxkL3ZpZXcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9vYnNlcnZhYmxlID0gcmVxdWlyZSgncHlkaW8vbGFuZy9vYnNlcnZhYmxlJyk7XG5cbnZhciBfb2JzZXJ2YWJsZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9vYnNlcnZhYmxlKTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgU3RhdHVzSXRlbSA9IGZ1bmN0aW9uIChfT2JzZXJ2YWJsZSkge1xuICAgIF9pbmhlcml0cyhTdGF0dXNJdGVtLCBfT2JzZXJ2YWJsZSk7XG5cbiAgICBmdW5jdGlvbiBTdGF0dXNJdGVtKHR5cGUsIHRhcmdldE5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3RhdHVzSXRlbSk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFN0YXR1c0l0ZW0uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdGF0dXNJdGVtKSkuY2FsbCh0aGlzKSk7XG5cbiAgICAgICAgX3RoaXMuX3N0YXR1cyA9IFN0YXR1c0l0ZW0uU3RhdHVzTmV3O1xuICAgICAgICBfdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgICAgIF90aGlzLl9pZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIF90aGlzLl9lcnJvck1lc3NhZ2UgPSBudWxsO1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgX3RoaXMuX3JlcG9zaXRvcnlJZCA9IHBhcmVudCA/IHBhcmVudC5nZXRSZXBvc2l0b3J5SWQoKSA6IHB5ZGlvLnVzZXIuYWN0aXZlUmVwb3NpdG9yeTtcbiAgICAgICAgX3RoaXMuX2V4aXN0cyA9IGZhbHNlO1xuICAgICAgICBfdGhpcy5fcHJvZ3Jlc3MgPSAwO1xuICAgICAgICBfdGhpcy5jaGlsZHJlbiA9IHsgZm9sZGVyczogW10sIGZpbGVzOiBbXSwgcGc6IHt9IH07XG4gICAgICAgIF90aGlzLl90YXJnZXROb2RlID0gdGFyZ2V0Tm9kZTtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgX3RoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVGb2xkZXIpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4uZm9sZGVycy5wdXNoKF90aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuLmZpbGVzLnB1c2goX3RoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU3RhdHVzSXRlbSwgW3tcbiAgICAgICAga2V5OiAnZ2V0SWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SWQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faWQ7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFBhcmVudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQYXJlbnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRMYWJlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMYWJlbCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sYWJlbC5ub3JtYWxpemUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWwubm9ybWFsaXplKCdORkMnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVMYWJlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVMYWJlbChsYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5fbGFiZWwgPSBsYWJlbDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0RnVsbFBhdGgnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RnVsbFBhdGgoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50LmdldEZ1bGxQYXRoKCkgKyAnLycgKyB0aGlzLmdldExhYmVsKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFByb2dyZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldFByb2dyZXNzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Byb2dyZXNzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRFeGlzdHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RXhpc3RzKCkge1xuICAgICAgICAgICAgdGhpcy5fZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0RXhpc3RzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEV4aXN0cygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9leGlzdHM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldFR5cGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VHlwZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRTdGF0dXMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXR1cztcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0U3RhdHVzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFN0YXR1cyhzdGF0dXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgICAgIHRoaXMubm90aWZ5KCdzdGF0dXMnLCBzdGF0dXMpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVSZXBvc2l0b3J5SWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlUmVwb3NpdG9yeUlkKHJlcG9zaXRvcnlJZCkge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3NpdG9yeUlkID0gcmVwb3NpdG9yeUlkO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRSZXBvc2l0b3J5SWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0UmVwb3NpdG9yeUlkKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlcG9zaXRvcnlJZDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0RXJyb3JNZXNzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEVycm9yTWVzc2FnZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9lcnJvck1lc3NhZ2UgfHwgJyc7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uRXJyb3InLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25FcnJvcihlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yTWVzc2FnZSA9IGVycm9yTWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKFN0YXR1c0l0ZW0uU3RhdHVzRXJyb3IpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwcm9jZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByb2Nlc3MoY29tcGxldGVDYWxsYmFjaykge1xuICAgICAgICAgICAgdGhpcy5fZG9Qcm9jZXNzKGNvbXBsZXRlQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhYm9ydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhYm9ydChjb21wbGV0ZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZG9BYm9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RvQWJvcnQoY29tcGxldGVDYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BhdXNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RvUGF1c2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdHVzID0gdGhpcy5fZG9QYXVzZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKHN0YXR1cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Jlc3VtZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZG9SZXN1bWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kb1Jlc3VtZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdHVzKFN0YXR1c0l0ZW0uU3RhdHVzTG9hZGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2FkZENoaWxkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZENoaWxkKGNoaWxkKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5wZ1tjaGlsZC5nZXRJZCgpXSA9IDA7XG4gICAgICAgICAgICBjaGlsZC5vYnNlcnZlKCdwcm9ncmVzcycsIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIF90aGlzMi5jaGlsZHJlbi5wZ1tjaGlsZC5nZXRJZCgpXSA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICAgIF90aGlzMi5yZWNvbXB1dGVQcm9ncmVzcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlY29tcHV0ZVByb2dyZXNzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlY29tcHV0ZVByb2dyZXNzKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBhY2N1ID0gT2JqZWN0LmtleXModGhpcy5jaGlsZHJlbi5wZykubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5jaGlsZHJlbi5wZ1trXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFjY3UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1bSA9IGFjY3UucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhICsgYjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9ncmVzcyA9IHN1bSAvIGFjY3UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCdwcm9ncmVzcycsIHRoaXMuX3Byb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlQ2hpbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlQ2hpbGQoY2hpbGQpIHtcblxuICAgICAgICAgICAgY2hpbGQuYWJvcnQoKTtcbiAgICAgICAgICAgIGNoaWxkLndhbGsoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICBjLmFib3J0KCk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LCBTdGF0dXNJdGVtLlR5cGVGaWxlKTtcblxuICAgICAgICAgICAgdmFyIGlkID0gY2hpbGQuZ2V0SWQoKTtcbiAgICAgICAgICAgIHZhciBmb2xkZXJJbmRleCA9IHRoaXMuY2hpbGRyZW4uZm9sZGVycy5pbmRleE9mKGNoaWxkKTtcbiAgICAgICAgICAgIHZhciBmaWxlSW5kZXggPSB0aGlzLmNoaWxkcmVuLmZpbGVzLmluZGV4T2YoY2hpbGQpO1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGZvbGRlckluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvbGRlcnMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KHRoaXMuY2hpbGRyZW4uZm9sZGVycywgZm9sZGVySW5kZXgpO1xuICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxlSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZmlsZXMgPSBMYW5nVXRpbHMuYXJyYXlXaXRob3V0KHRoaXMuY2hpbGRyZW4uZmlsZXMsIGZpbGVJbmRleCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnN0b3BPYnNlcnZpbmcoJ3Byb2dyZXNzJyk7XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jaGlsZHJlbi5wZ1tpZF07XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvbXB1dGVQcm9ncmVzcygpO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5KCdjaGlsZHJlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRDaGlsZHJlbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDaGlsZHJlbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KHRoaXMuY2hpbGRyZW4uZm9sZGVycyksIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLmNoaWxkcmVuLmZpbGVzKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3dhbGsnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gd2FsayhjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBTdGF0dXNJdGVtLlR5cGVCb3RoO1xuICAgICAgICAgICAgdmFyIHN0b3AgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBTdGF0dXNJdGVtLlR5cGVCb3RoIHx8IHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUZpbGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsZXMgPSB0aGlzLmNoaWxkcmVuLmZpbGVzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3AoZmlsZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXIoZmlsZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmaWxlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9sZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgIGlmICgodHlwZSA9PT0gU3RhdHVzSXRlbS5UeXBlRm9sZGVyIHx8IHR5cGUgPT09IFN0YXR1c0l0ZW0uVHlwZUJvdGgpICYmIGZpbHRlcihjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXN0b3AoY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLndhbGsoY2FsbGJhY2ssIGZpbHRlciwgdHlwZSwgc3RvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbGxlY3RXaXRoTGltaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29sbGVjdFdpdGhMaW1pdChsaW1pdCkge1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAnYm90aCc7XG5cbiAgICAgICAgICAgIHZhciBhY2N1ID0gW107XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiBjYWxsYmFjayhpdGVtKSB7XG4gICAgICAgICAgICAgICAgYWNjdS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBzdG9wID0gZnVuY3Rpb24gc3RvcChpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY3UubGVuZ3RoID49IGxpbWl0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMud2FsayhjYWxsYmFjaywgZmlsdGVyLCB0eXBlLCBzdG9wKTtcbiAgICAgICAgICAgIHJldHVybiBhY2N1O1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFN0YXR1c0l0ZW07XG59KF9vYnNlcnZhYmxlMi5kZWZhdWx0KTtcblxuU3RhdHVzSXRlbS5TdGF0dXNOZXcgPSAnbmV3JztcblN0YXR1c0l0ZW0uU3RhdHVzQW5hbHl6ZSA9ICdhbmFseXNlJztcblN0YXR1c0l0ZW0uU3RhdHVzTG9hZGluZyA9ICdsb2FkaW5nJztcblN0YXR1c0l0ZW0uU3RhdHVzTG9hZGVkID0gJ2xvYWRlZCc7XG5TdGF0dXNJdGVtLlN0YXR1c0Vycm9yID0gJ2Vycm9yJztcblN0YXR1c0l0ZW0uU3RhdHVzUGF1c2UgPSAncGF1c2UnO1xuU3RhdHVzSXRlbS5TdGF0dXNDYW5ub3RQYXVzZSA9ICdjYW5ub3QtcGF1c2UnO1xuU3RhdHVzSXRlbS5TdGF0dXNNdWx0aVBhdXNlID0gJ211bHRpLXBhdXNlJztcblxuU3RhdHVzSXRlbS5UeXBlRm9sZGVyID0gJ2ZvbGRlcic7XG5TdGF0dXNJdGVtLlR5cGVGaWxlID0gJ2ZpbGUnO1xuU3RhdHVzSXRlbS5UeXBlQm90aCA9ICdib3RoJztcblxuZXhwb3J0cy5kZWZhdWx0ID0gU3RhdHVzSXRlbTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ2xlYXJPcHRpb25zUGFuZSA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENsZWFyT3B0aW9uc1BhbmUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ2xlYXJPcHRpb25zUGFuZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENsZWFyT3B0aW9uc1BhbmUpO1xuXG4gICAgICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQ2xlYXJPcHRpb25zUGFuZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENsZWFyT3B0aW9uc1BhbmUpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2xlYXJPcHRpb25zUGFuZSwgW3tcbiAgICAgICAga2V5OiAnY2xlYXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHN3aXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWxsXCI6XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLmNsZWFyQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsb2FkZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuY2xlYXJTdGF0dXMoJ2xvYWRlZCcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZXJyb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUuY2xlYXJTdGF0dXMoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbXNnID0gX3B5ZGlvMi5kZWZhdWx0LmdldE1lc3NhZ2VzKCk7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMucHJvcHMuYW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uIG9uUmVxdWVzdENsb3NlKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NZW51LFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAxNDYgfSwgZGVza3RvcDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgbGluZUhlaWdodDogJzI2cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZ1snaHRtbF91cGxvYWRlci5jbGVhci1oZWFkZXInXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbXNnWydodG1sX3VwbG9hZGVyLmNsZWFyLWZpbmlzaGVkJ10sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uIG9uVG91Y2hUYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmNsZWFyKCdsb2FkZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBtc2dbJ2h0bWxfdXBsb2FkZXIuY2xlYXItZmFpbGVkJ10sIG9uVG91Y2hUYXA6IGZ1bmN0aW9uIG9uVG91Y2hUYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLmNsZWFyKCdlcnJvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IG1zZ1snaHRtbF91cGxvYWRlci5jbGVhci1hbGwnXSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gb25Ub3VjaFRhcCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuY2xlYXIoJ2FsbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2xlYXJPcHRpb25zUGFuZTtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENsZWFyT3B0aW9uc1BhbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIENvbmZpcm1FeGlzdHMgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDb25maXJtRXhpc3RzLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENvbmZpcm1FeGlzdHMocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbmZpcm1FeGlzdHMpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDb25maXJtRXhpc3RzLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29uZmlybUV4aXN0cykpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLFxuICAgICAgICAgICAgc2F2ZVZhbHVlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENvbmZpcm1FeGlzdHMsIFt7XG4gICAgICAgIGtleTogJ2NhbmNlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N1Ym1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBzYXZlVmFsdWUgPSBfc3RhdGUuc2F2ZVZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ29uZmlybSh2YWx1ZSwgc2F2ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tDaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tDaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzYXZlVmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyYWRpb0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWRpb0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfc3RhdGUyLnZhbHVlLFxuICAgICAgICAgICAgICAgIHNhdmVWYWx1ZSA9IF9zdGF0ZTIuc2F2ZVZhbHVlO1xuXG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCB0b3A6IDQ5LCBsZWZ0OiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNyknIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDUwMCwgcGFkZGluZzogMTYsIGZvbnRTaXplOiAxNCwgbWFyZ2luOiAnMCBhdXRvJyB9LCB6RGVwdGg6IDIgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbMTI0XVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IHZhbHVlLCBvbkNoYW5nZTogdGhpcy5yYWRpb0NoYW5nZS5iaW5kKHRoaXMpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdyZW5hbWUtZm9sZGVycycsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLnJlbmFtZS5hbGwnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0ucmVuYW1lLm1lcmdlJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLm92ZXJ3cml0ZSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luVG9wOiAzMCwgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0uc2F2ZS5jaG9pY2UnXSwgY2hlY2tlZDogc2F2ZVZhbHVlLCBvbkNoZWNrOiB0aGlzLmNoZWNrQ2hhbmdlLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbNTRdLCBvblRvdWNoVGFwOiB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IHByaW1hcnk6IHRydWUsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs0OF0sIG9uVG91Y2hUYXA6IHRoaXMuc3VibWl0LmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ29uZmlybUV4aXN0cztcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENvbmZpcm1FeGlzdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfVXBsb2FkT3B0aW9uc1BhbmUgPSByZXF1aXJlKCcuL1VwbG9hZE9wdGlvbnNQYW5lJyk7XG5cbnZhciBfVXBsb2FkT3B0aW9uc1BhbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkT3B0aW9uc1BhbmUpO1xuXG52YXIgX0NsZWFyT3B0aW9uc1BhbmUgPSByZXF1aXJlKCcuL0NsZWFyT3B0aW9uc1BhbmUnKTtcblxudmFyIF9DbGVhck9wdGlvbnNQYW5lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NsZWFyT3B0aW9uc1BhbmUpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG52YXIgX0NvbmZpcm1FeGlzdHMgPSByZXF1aXJlKCcuL0NvbmZpcm1FeGlzdHMnKTtcblxudmFyIF9Db25maXJtRXhpc3RzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpcm1FeGlzdHMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKCdob2MnKSxcbiAgICBkcm9wUHJvdmlkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5kcm9wUHJvdmlkZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yLmRlZmF1bHQucmVxdWlyZUxpYignZm9ybScpLFxuICAgIEZpbGVEcm9wWm9uZSA9IF9QeWRpbyRyZXF1aXJlTGliMi5GaWxlRHJvcFpvbmU7XG5cbnZhciBEcm9wVXBsb2FkZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEcm9wVXBsb2FkZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRHJvcFVwbG9hZGVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEcm9wVXBsb2FkZXIpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEcm9wVXBsb2FkZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihEcm9wVXBsb2FkZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBfdGhpcy5fc3RvcmVPYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzZXNzaW9uczogc3RvcmUuZ2V0U2Vzc2lvbnMoKSxcbiAgICAgICAgICAgICAgICBzdG9yZVJ1bm5pbmc6IHN0b3JlLmlzUnVubmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgc3RvcmUub2JzZXJ2ZShcInVwZGF0ZVwiLCBfdGhpcy5fc3RvcmVPYnNlcnZlcik7XG4gICAgICAgIHN0b3JlLm9ic2VydmUoXCJhdXRvX2Nsb3NlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5wcm9wcy5vbkRpc21pc3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93T3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICBjb25maWdzOiBVcGxvYWRlck1vZGVsLkNvbmZpZ3MuZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgIHNlc3Npb25zOiBzdG9yZS5nZXRTZXNzaW9ucygpLFxuICAgICAgICAgICAgc3RvcmVSdW5uaW5nOiBzdG9yZS5pc1J1bm5pbmcoKSxcbiAgICAgICAgICAgIGNvbmZpcm1EaWFsb2c6IHByb3BzLmNvbmZpcm1EaWFsb2dcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEcm9wVXBsb2FkZXIsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuY29uZmlybURpYWxvZyAhPT0gdGhpcy5zdGF0ZS5jb25maXJtRGlhbG9nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IG5leHRQcm9wcy5jb25maXJtRGlhbG9nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yZU9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIiwgdGhpcy5fc3RvcmVPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnN0b3BPYnNlcnZpbmcoXCJhdXRvX2Nsb3NlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkRyb3AnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ecm9wKGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dE5vZGUgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0Q29udGV4dE5vZGUoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5oYW5kbGVEcm9wRXZlbnRSZXN1bHRzKG51bGwsIGZpbGVzLCBjb250ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uRm9sZGVyUGlja2VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRm9sZGVyUGlja2VkKGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dE5vZGUgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0Q29udGV4dE5vZGUoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5oYW5kbGVGb2xkZXJQaWNrZXJSZXN1bHQoZmlsZXMsIGNvbnRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3RhcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnQoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnJlc3VtZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwYXVzZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZShlKSB7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb3BlbkNsZWFyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5DbGVhcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzaG93Q2xlYXI6IHRydWUsXG4gICAgICAgICAgICAgICAgY2xlYXJBbmNob3JFbDogZS5jdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndG9nZ2xlT3B0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGVPcHRpb25zKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIF9zdGF0ZSRzaG93T3B0aW9ucyA9IF9zdGF0ZS5zaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzaG93T3B0aW9ucyA9IF9zdGF0ZSRzaG93T3B0aW9ucyA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfc3RhdGUkc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldCA9IF9zdGF0ZS5jdXJyZW50VGFyZ2V0O1xuXG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zOiAhc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuY2hvckVsOiBlLmN1cnJlbnRUYXJnZXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuRmlsZVBpY2tlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRmlsZVBpY2tlcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuZHJvcHpvbmUub3BlbigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuRm9sZGVyUGlja2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5Gb2xkZXJQaWNrZXIoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5yZWZzLmRyb3B6b25lLm9wZW5Gb2xkZXJQaWNrZXIoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlhbG9nU3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpYWxvZ1N1Ym1pdChuZXdWYWx1ZSwgc2F2ZVZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmdldFNlc3Npb25zKCkuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldFN0YXR1cygpID09PSAnY29uZmlybScpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi5wcmVwYXJlKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChzYXZlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2V4aXN0aW5nJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IGZhbHNlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ3VwbG9hZCcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaWFsb2dDYW5jZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlhbG9nQ2FuY2VsKCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgc3RvcmUuZ2V0U2Vzc2lvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb24uZ2V0U3RhdHVzKCkgPT09ICdjb25maXJtJykge1xuICAgICAgICAgICAgICAgICAgICBzdG9yZS5yZW1vdmVTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IGZhbHNlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ3VwbG9hZCcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdXBwb3J0c0ZvbGRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdXBwb3J0c0ZvbGRlcigpIHtcbiAgICAgICAgICAgIHZhciBzdXBwb3J0cyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGUgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGUuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ZpbGUnKTtcbiAgICAgICAgICAgIGlmICgnd2Via2l0ZGlyZWN0b3J5JyBpbiBlKSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZSA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBzaG93RGlzbWlzcyA9IF9wcm9wcy5zaG93RGlzbWlzcyxcbiAgICAgICAgICAgICAgICBvbkRpc21pc3MgPSBfcHJvcHMub25EaXNtaXNzO1xuXG4gICAgICAgICAgICB2YXIgY29ubmVjdERyb3BUYXJnZXQgPSB0aGlzLnByb3BzLmNvbm5lY3REcm9wVGFyZ2V0IHx8IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3MgPSBfc3RhdGUyLmNvbmZpZ3MsXG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnMgPSBfc3RhdGUyLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNBbmNob3JFbCA9IF9zdGF0ZTIub3B0aW9uc0FuY2hvckVsLFxuICAgICAgICAgICAgICAgIHNob3dDbGVhciA9IF9zdGF0ZTIuc2hvd0NsZWFyLFxuICAgICAgICAgICAgICAgIGNsZWFyQW5jaG9yRWwgPSBfc3RhdGUyLmNsZWFyQW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgc2Vzc2lvbnMgPSBfc3RhdGUyLnNlc3Npb25zLFxuICAgICAgICAgICAgICAgIHN0b3JlUnVubmluZyA9IF9zdGF0ZTIuc3RvcmVSdW5uaW5nLFxuICAgICAgICAgICAgICAgIGNvbmZpcm1EaWFsb2cgPSBfc3RhdGUyLmNvbmZpcm1EaWFsb2c7XG5cbiAgICAgICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgdmFyIGxpc3RFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBzZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMuZ2V0Q2hpbGRyZW4oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdEVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjb25uZWN0RHJvcFRhcmdldChfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRkFGQUZBJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBwYWRkaW5nTGVmdDogMTYsIHBhZGRpbmdSaWdodDogMTYsIHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdoMycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IG1hcmdpbkJvdHRvbTogMTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuZGlhbG9nLnRpdGxlJ11cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktZG90cy12ZXJ0aWNhbFwiLCBwcmltYXJ5OiB0cnVlLCBpY29uU3R5bGU6IHsgZm9udFNpemU6IDE4IH0sIHN0eWxlOiB7IHBhZGRpbmc6IDE0IH0sIHRvb2x0aXA6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLm9wdGlvbnMnXSwgb25Ub3VjaFRhcDogdGhpcy50b2dnbGVPcHRpb25zLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktcGxheScgfSksIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci5zdGFydCddLCBvblRvdWNoVGFwOiB0aGlzLnN0YXJ0LmJpbmQodGhpcyksIHByaW1hcnk6IHRydWUsIGRpc2FibGVkOiBzdG9yZS5pc1J1bm5pbmcoKSB8fCAhc3RvcmUuaGFzUXVldWUoKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1wYXVzZScgfSksIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci5wYXVzZSddLCBvblRvdWNoVGFwOiB0aGlzLnBhdXNlLmJpbmQodGhpcyksIHByaW1hcnk6IHRydWUsIGRpc2FibGVkOiAhc3RvcmUuaXNSdW5uaW5nKCkgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktZGVsZXRlJyB9KSwgbGFiZWw6IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLmNsZWFyJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLW1lbnUtZG93blwiIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5DbGVhci5iaW5kKHRoaXMpLCBwcmltYXJ5OiB0cnVlLCBkaXNhYmxlZDogbGlzdEVtcHR5IH0pLFxuICAgICAgICAgICAgICAgICAgICBzaG93RGlzbWlzcyAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1jbG9zZVwiLCBzdHlsZTogeyBwYWRkaW5nOiAxNCB9LCBvblRvdWNoVGFwOiBmdW5jdGlvbiBvblRvdWNoVGFwKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBGaWxlRHJvcFpvbmUsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyYW5zcGFyZW50LWRyb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2Ryb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRm9sZGVyczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRDbGljazogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVOYXRpdmVEcm9wOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ecm9wOiB0aGlzLm9uRHJvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2xkZXJQaWNrZWQ6IHRoaXMub25Gb2xkZXJQaWNrZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogNDIwIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX1RyYW5zZmVyc0xpc3QyLmRlZmF1bHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25zOiBzZXNzaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3M6IHRoaXMucHJvcHMub25EaXNtaXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmU6IHN0b3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25QaWNrRmlsZTogZnVuY3Rpb24gb25QaWNrRmlsZShldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5vcGVuRmlsZVBpY2tlcihldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25QaWNrRm9sZGVyOiB0aGlzLnN1cHBvcnRzRm9sZGVyKCkgPyBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIub3BlbkZvbGRlclBpY2tlcihldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX1VwbG9hZE9wdGlvbnNQYW5lMi5kZWZhdWx0LCB7IGNvbmZpZ3M6IGNvbmZpZ3MsIG9wZW46IHNob3dPcHRpb25zLCBhbmNob3JFbDogb3B0aW9uc0FuY2hvckVsLCBvbkRpc21pc3M6IGZ1bmN0aW9uIG9uRGlzbWlzcyhlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlT3B0aW9ucyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfQ2xlYXJPcHRpb25zUGFuZTIuZGVmYXVsdCwgeyBjb25maWdzOiBjb25maWdzLCBvcGVuOiBzaG93Q2xlYXIsIGFuY2hvckVsOiBjbGVhckFuY2hvckVsLCBvbkRpc21pc3M6IGZ1bmN0aW9uIG9uRGlzbWlzcygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHNob3dDbGVhcjogZmFsc2UsIGNsZWFyQW5jaG9yRWw6IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgY29uZmlybURpYWxvZyAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfQ29uZmlybUV4aXN0czIuZGVmYXVsdCwgeyBvbkNvbmZpcm06IHRoaXMuZGlhbG9nU3VibWl0LmJpbmQodGhpcyksIG9uQ2FuY2VsOiB0aGlzLmRpYWxvZ0NhbmNlbC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wVXBsb2FkZXI7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEcm9wVXBsb2FkZXIgPSBkcm9wUHJvdmlkZXIoRHJvcFVwbG9hZGVyKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRHJvcFVwbG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX1N0YXR1c0l0ZW0gPSByZXF1aXJlKCcuLi9tb2RlbC9TdGF0dXNJdGVtJyk7XG5cbnZhciBfU3RhdHVzSXRlbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdGF0dXNJdGVtKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgdXBsb2FkU3RhdHVzTWVzc2FnZXMgPSB7XG4gICAgXCJuZXdcIjogNDMzLFxuICAgIFwibG9hZGluZ1wiOiA0MzQsXG4gICAgXCJsb2FkZWRcIjogNDM1LFxuICAgIFwiZXJyb3JcIjogNDM2XG59O1xuXG52YXIgVHJhbnNmZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhUcmFuc2ZlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2Zlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhbnNmZXIpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChUcmFuc2Zlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFRyYW5zZmVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICBzaG93QWxsOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXR1czogcHJvcHMuaXRlbS5nZXRTdGF0dXMoKSxcbiAgICAgICAgICAgIHByZXZpZXdVcmw6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogcHJvcHMuaXRlbS5nZXRQcm9ncmVzcygpIHx8IDBcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIHRoaXMuX3BnT2JzZXJ2ZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBwcm9ncmVzczogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fc3RhdHVzT2JzZXJ2ZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzdGF0dXM6IHZhbHVlIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGl0ZW0ub2JzZXJ2ZSgncHJvZ3Jlc3MnLCB0aGlzLl9wZ09ic2VydmVyKTtcbiAgICAgICAgICAgIGl0ZW0ub2JzZXJ2ZSgnc3RhdHVzJywgdGhpcy5fc3RhdHVzT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdjaGlsZHJlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlVwbG9hZEl0ZW0gJiYgL1xcLihqcGU/Z3xwbmd8Z2lmKSQvaS50ZXN0KGl0ZW0uZ2V0RmlsZSgpLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcHJldmlld1VybDogaXRlbS5wcmV2aWV3VXJsIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucHJldmlld1VybCA9IHJlYWRlci5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByZXZpZXdVcmw6IHJlYWRlci5yZXN1bHQgfSk7XG4gICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGl0ZW0uZ2V0RmlsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgaXRlbS5zdG9wT2JzZXJ2aW5nKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5zdG9wT2JzZXJ2aW5nKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0UGFyZW50KCkpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmdldFBhcmVudCgpLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhYm9ydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhYm9ydCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JldHJ5JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldHJ5KCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IF9wcm9wcy5pdGVtLFxuICAgICAgICAgICAgICAgIHN0b3JlID0gX3Byb3BzLnN0b3JlO1xuXG4gICAgICAgICAgICBpdGVtLnNldFN0YXR1cyhfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNOZXcpO1xuICAgICAgICAgICAgc3RvcmUucHJvY2Vzc05leHQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IF9wcm9wczIuaXRlbSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBfcHJvcHMyLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IF9wcm9wczIuc3R5bGUsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBfcHJvcHMyLmxpbWl0LFxuICAgICAgICAgICAgICAgIGxldmVsID0gX3Byb3BzMi5sZXZlbCxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zID0gX3Byb3BzMi5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIHN0b3JlID0gX3Byb3BzMi5zdG9yZTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIG9wZW4gPSBfc3RhdGUub3BlbixcbiAgICAgICAgICAgICAgICBzaG93QWxsID0gX3N0YXRlLnNob3dBbGwsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBfc3RhdGUucHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgc3RhdHVzID0gX3N0YXRlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICBwcmV2aWV3VXJsID0gX3N0YXRlLnByZXZpZXdVcmw7XG5cbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IGl0ZW0uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgICAgIHZhciBpc0RpciA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLkZvbGRlckl0ZW07XG4gICAgICAgICAgICB2YXIgaXNQYXJ0ID0gaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuUGFydEl0ZW07XG4gICAgICAgICAgICB2YXIgaXNTZXNzaW9uID0gaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuU2Vzc2lvbjtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IF9weWRpbzIuZGVmYXVsdC5nZXRNZXNzYWdlcygpO1xuXG4gICAgICAgICAgICB2YXIgc3R5bGVzID0ge1xuICAgICAgICAgICAgICAgIG1haW46IF9leHRlbmRzKHt9LCBzdHlsZSwge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTQsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzQyNDI0MidcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAobGV2ZWwgLSAxKSAqIDI0LFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiBsZXZlbCA+IDEgPyAxMCA6IDE2LFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiA2LFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6IGNoaWxkcmVuLmxlbmd0aCA/ICdwb2ludGVyJyA6ICdkZWZhdWx0JyxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyTGVmdDogbGV2ZWwgPT09IDEgPyAnM3B4IHNvbGlkIHRyYW5zcGFyZW50JyA6ICcnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlMaW5lOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IC4zLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZnRJY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpc1BhcnQgPyAnIzllOWU5ZScgOiAnIzYxNjE2MScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxOFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJldmlld0ltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlJyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb3ZlcicsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBpc0RpciA/IDUwMCA6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogaXNQYXJ0ID8gJ2l0YWxpYycgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyck1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjZTUzOTM1JyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBnQmFyOiB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbjoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDQ4LFxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjOWU5ZTllJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2dnbGVJY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IDRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRDb21wcyA9IFtdLFxuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHBnQ29sb3IgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgZXJyTWVzc2FnZSA9IHZvaWQgMDtcblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVuIHx8IGlzU2Vzc2lvbiAmJiBzdGF0dXMgIT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNsaWNlZCA9IHNob3dBbGwgPyBjaGlsZHJlbiA6IGNoaWxkcmVuLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb21wcyA9IHNsaWNlZC5tYXAoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoVHJhbnNmZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGNoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uczogZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZTogc3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNsaWNlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkQ29tcHMucHVzaChfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGVzLmxpbmUsIHsgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlckxlZnQ6ICcnLCBwYWRkaW5nTGVmdDogbGV2ZWwgKiAyMCB9KSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IHNob3dBbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktcGx1cy1ib3gtb3V0bGluZVwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLmxpc3Quc2hvdy1tb3JlJ10ucmVwbGFjZSgnJWQnLCBjaGlsZHJlbi5sZW5ndGggLSBzbGljZWQubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gZnVuY3Rpb24gdG9nZ2xlQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG9wZW46ICFvcGVuIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBvbkNsaWNrOiB0b2dnbGVDYWxsYmFjaywgc3R5bGU6IHN0eWxlcy50b2dnbGVJY29uLCBjbGFzc05hbWU6IFwibWRpIG1kaS1jaGV2cm9uLVwiICsgKG9wZW4gPyBcImRvd25cIiA6IFwicmlnaHRcIikgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0Rpcikge1xuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IFwibWRpIG1kaS1mb2xkZXJcIjtcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNsb3NlLWNpcmNsZS1vdXRsaW5lJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQYXJ0KSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLXBhY2thZ2UtdXBcIjtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLWZpbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3BhdGgyLmRlZmF1bHQuZ2V0RmlsZUV4dGVuc2lvbihpdGVtLmdldEZ1bGxQYXRoKCkpO1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfZXh0ZW5zaW9ucyRnZXQgPSBleHRlbnNpb25zLmdldChleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udEljb24gPSBfZXh0ZW5zaW9ucyRnZXQuZm9udEljb247XG5cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gJ21pbWVmb250IG1kaSBtZGktJyArIGZvbnRJY29uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0xvYWRpbmcgfHwgc3RhdHVzID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNDYW5ub3RQYXVzZSB8fCBzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c011bHRpUGF1c2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1zdG9wJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBfU3RhdHVzSXRlbTIuZGVmYXVsdC5TdGF0dXNFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyNlNTM5MzUnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1yZXN0YXJ0XCIsIHN0eWxlOiB7IGNvbG9yOiAnI2U1MzkzNScgfSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucmV0cnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjNGNhZjUwJztcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1jbG9zZS1jaXJjbGUtb3V0bGluZScsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3NCYXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaW5lYXJQcm9ncmVzcywgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlZWVlJywgaGVpZ2h0OiAzIH0sIGNvbG9yOiBwZ0NvbG9yLCBtaW46IDAsIG1heDogMTAwLCB2YWx1ZTogcHJvZ3Jlc3MsIG1vZGU6IFwiZGV0ZXJtaW5hdGVcIiB9KTtcblxuICAgICAgICAgICAgaWYgKGlzU2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IF9TdGF0dXNJdGVtMi5kZWZhdWx0LlN0YXR1c0FuYWx5emUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuYW5hbHl6ZS5zdGVwXCJdO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBzaXplOiAxNiwgdGhpY2tuZXNzOiAyLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDEgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5sZWZ0SWNvbiwgeyBtYXJnaW5Ub3A6IC00LCBtYXJnaW5Cb3R0b206IC01IH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBfZXh0ZW5kcyh7IGJhY2tncm91bmQ6ICd1cmwoJyArIHByZXZpZXdVcmwgKyAnKScgfSwgc3R5bGVzLnByZXZpZXdJbWFnZSkgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBpY29uQ2xhc3MsIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3R5bGVzLnByZXZpZXdJbWFnZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0eWxlcy5wcmV2aWV3SW1hZ2UuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IHN0eWxlcy5wcmV2aWV3SW1hZ2Uud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNFQ0VGRjEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogNlxuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT09ICdlcnJvcicgJiYgaXRlbS5nZXRFcnJvck1lc3NhZ2UoKSkge1xuICAgICAgICAgICAgICAgIGVyck1lc3NhZ2UgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMuZXJyTWVzc2FnZSwgdGl0bGU6IGl0ZW0uZ2V0RXJyb3JNZXNzYWdlKCkgfSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5nZXRFcnJvck1lc3NhZ2UoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3RhdHVzTGFiZWwgPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgaXRlbVR5cGUgPSBpc0RpciA/IFwiZGlyXCIgOiBpc1BhcnQgPyBcInBhcnRcIiA6IFwiZmlsZVwiO1xuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgICAgIHN0YXR1c0xhYmVsID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLmVyck1lc3NhZ2UsIHRpdGxlOiBpdGVtLmdldEVycm9yTWVzc2FnZSgpIH0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0RXJyb3JNZXNzYWdlKClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNMYWJlbCA9IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnN0YXR1cy4nICsgaXRlbVR5cGUgKyAnLicgKyBzdGF0dXNdIHx8IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLnN0YXR1cy4nICsgc3RhdHVzXSB8fCBzdGF0dXM7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0U2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNMYWJlbCA9IGl0ZW0uZ2V0SHVtYW5TaXplKCkgKyAnIC0gJyArIHN0YXR1c0xhYmVsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5tYWluLCBjbGFzc05hbWU6IFwidXBsb2FkLVwiICsgc3RhdHVzICsgXCIgXCIgKyAoY2xhc3NOYW1lID8gY2xhc3NOYW1lIDogXCJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5saW5lIH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZnRJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBvdmVyZmxvdzogJ2hpZGRlbicsIHBhZGRpbmdMZWZ0OiA0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlblxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5zZWNvbmRhcnlMaW5lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzTGFiZWxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMucGdCYXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5yaWdodEJ1dHRvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2hpbGRDb21wc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2Zlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1RyYW5zZmVyID0gcmVxdWlyZSgnLi9UcmFuc2ZlcicpO1xuXG52YXIgX1RyYW5zZmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyKTtcblxudmFyIF9zdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9kb20gPSByZXF1aXJlKCdweWRpby91dGlsL2RvbScpO1xuXG52YXIgX2RvbTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kb20pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBUcmFuc2ZlcnNMaXN0ID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVHJhbnNmZXJzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2ZlcnNMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2ZlcnNMaXN0KTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyc0xpc3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUcmFuc2ZlcnNMaXN0KSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlcnNMaXN0LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgc2Vzc2lvbnMgPSBfcHJvcHMuc2Vzc2lvbnMsXG4gICAgICAgICAgICAgICAgc3RvcmUgPSBfcHJvcHMuc3RvcmUsXG4gICAgICAgICAgICAgICAgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWUsXG4gICAgICAgICAgICAgICAgb25QaWNrRmlsZSA9IF9wcm9wcy5vblBpY2tGaWxlLFxuICAgICAgICAgICAgICAgIG9uUGlja0ZvbGRlciA9IF9wcm9wcy5vblBpY2tGb2xkZXI7XG5cbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gX2RvbTIuZGVmYXVsdC5nZXRCZXppZXJzVHJhbnNpdGlvbigpLnJlcGxhY2UoJ2FsbCAnLCAnY29sb3IgJyk7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKTtcbiAgICAgICAgICAgIHZhciBjc3MgPSAnXFxuICAgICAgICAgICAgLmRyb3AtdHJhbnNmZXItbGlzdHtcXG4gICAgICAgICAgICAgICAgY29sb3I6cmdiYSgzLCAxNjksIDI0NCwgMC41KTtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAgICAgLnRyYW5zcGFyZW50LWRyb3B6b25lLmFjdGl2ZSAuZHJvcC10cmFuc2Zlci1saXN0e1xcbiAgICAgICAgICAgICAgICBjb2xvcjpyZ2JhKDMsIDE2OSwgMjQ0LCAwLjgpO1xcbiAgICAgICAgICAgIH1cXG4gICAgICAgICAgICAuZHJvcC10cmFuc2Zlci1saXN0IGEsLmRyb3AtdHJhbnNmZXItbGlzdCBhOmhvdmVyIHtcXG4gICAgICAgICAgICAgICAgY29sb3I6cmdiYSgzLCAxNjksIDI0NCwgMSk7XFxuICAgICAgICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICAgICAgICB9XFxuICAgICAgICAnO1xuXG4gICAgICAgICAgICB2YXIgc2Vzc2lvbnNMaXN0ID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKHNlc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzRW1wdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50cyA9IHNlc3Npb25zLm1hcChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXIyLmRlZmF1bHQsIHsgaXRlbTogc2Vzc2lvbiwgc3RvcmU6IHN0b3JlLCBzdHlsZToge30sIGxpbWl0OiAxMCwgbGV2ZWw6IDAsIGV4dGVuc2lvbnM6IGV4dCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbnNMaXN0ID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgaGVpZ2h0OiAnMTAwJScsIG92ZXJmbG93WTogJ2F1dG8nLCBwYWRkaW5nOiAxMCwgcGFkZGluZ0JvdHRvbTogMjAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRyb3BwZXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGhlaWdodDogJzEwMCUnLCB3aWR0aDogJzEwMCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRjVGNUY1JywgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiB9LCBjbGFzc05hbWU6IFwiZHJvcC10cmFuc2Zlci1saXN0XCIgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAnY2VudGVyJywgd2lkdGg6ICcxMDAlJywgZm9udFdlaWdodDogNTAwLCBmb250U2l6ZTogMTgsIHBhZGRpbmc6IDI0LCBsaW5lSGVpZ2h0OiAnMjhweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNsb3VkLXVwbG9hZCcsIHN0eWxlOiB7IGZvbnRTaXplOiAxMTAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcGhlcmVcIl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1vclwiXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IG9uUGlja0ZpbGUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1waWNrLWZpbGVcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBvblBpY2tGb2xkZXIgJiYgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzW1wiaHRtbF91cGxvYWRlci5kcm9wLW9yXCJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG9uQ2xpY2s6IG9uUGlja0ZvbGRlciB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1tcImh0bWxfdXBsb2FkZXIuZHJvcC1waWNrLWZvbGRlclwiXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJywgeyB0eXBlOiBcInRleHQvY3NzXCIsIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MOiB7IF9faHRtbDogY3NzIH0gfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgaGVpZ2h0OiAnMTAwJScsIG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGRyb3BwZXJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHNlc3Npb25zTGlzdCAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDQyMCwgbWluV2lkdGg6IDQyMCwgbWF4V2lkdGg6IDQyMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb25zTGlzdFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVHJhbnNmZXJzTGlzdDtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyc0xpc3QgPSAoMCwgX3N0eWxlcy5tdWlUaGVtZWFibGUpKCkoVHJhbnNmZXJzTGlzdCk7XG5leHBvcnRzLmRlZmF1bHQgPSBUcmFuc2ZlcnNMaXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBVcGxvYWRPcHRpb25zUGFuZSA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVwbG9hZE9wdGlvbnNQYW5lLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVwbG9hZE9wdGlvbnNQYW5lKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkT3B0aW9uc1BhbmUpO1xuXG4gICAgICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoVXBsb2FkT3B0aW9uc1BhbmUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihVcGxvYWRPcHRpb25zUGFuZSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVcGxvYWRPcHRpb25zUGFuZSwgW3tcbiAgICAgICAga2V5OiAndXBkYXRlRmllbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRmllbGQoZk5hbWUsIGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMucHJvcHMuY29uZmlncztcblxuXG4gICAgICAgICAgICBpZiAoZk5hbWUgPT09ICdhdXRvc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlU3RhcnQgPSAhdG9nZ2xlU3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9hdXRvX3NlbmQnLCB0b2dnbGVTdGFydCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnYXV0b2Nsb3NlJykge1xuICAgICAgICAgICAgICAgIHZhciBfdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX0NMT1NFJywgJ3VwbG9hZF9hdXRvX2Nsb3NlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgX3RvZ2dsZVN0YXJ0ID0gIV90b2dnbGVTdGFydDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2F1dG9fY2xvc2UnLCBfdG9nZ2xlU3RhcnQsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ2V4aXN0aW5nJykge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBldmVudC50YXJnZXQuZ2V0U2VsZWN0ZWRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdzaG93X3Byb2Nlc3NlZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlU2hvd1Byb2Nlc3NlZCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdVUExPQURfU0hPV19QUk9DRVNTRUQnLCAndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVNob3dQcm9jZXNzZWQgPSAhdG9nZ2xlU2hvd1Byb2Nlc3NlZDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgdG9nZ2xlU2hvd1Byb2Nlc3NlZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmFuZG9tOiBNYXRoLnJhbmRvbSgpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyYWRpb0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWRpb0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cblxuICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9leGlzdGluZycsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByYW5kb206IE1hdGgucmFuZG9tKCkgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICB2YXIgdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnKTtcbiAgICAgICAgICAgIHZhciB0b2dnbGVDbG9zZSA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fQ0xPU0UnLCAndXBsb2FkX2F1dG9fY2xvc2UnKTtcbiAgICAgICAgICAgIHZhciBvdmVyd3JpdGVUeXBlID0gY29uZmlncy5nZXRPcHRpb24oJ0RFRkFVTFRfRVhJU1RJTkcnLCAndXBsb2FkX2V4aXN0aW5nJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5wcm9wcy5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gb25SZXF1ZXN0Q2xvc2UoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLm9uRGlzbWlzcyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzMjAsIHBhZGRpbmdCb3R0b206IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnT3B0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTZweCcsIG1hcmdpblRvcDogLTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZVN0YXJ0LCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b3N0YXJ0JyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzddLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZUNsb3NlLCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b2Nsb3NlJyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzhdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IG92ZXJ3cml0ZVR5cGUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ2FsZXJ0JywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcuYWxlcnQnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZy5mb2xkZXJzJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm1lcmdlJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm92ZXJ3cml0ZSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVwbG9hZE9wdGlvbnNQYW5lO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVXBsb2FkT3B0aW9uc1BhbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBleHBvcnRzLkRyb3BVcGxvYWRlciA9IHVuZGVmaW5lZDtcblxudmFyIF9Ecm9wVXBsb2FkZXIgPSByZXF1aXJlKCcuL0Ryb3BVcGxvYWRlcicpO1xuXG52YXIgX0Ryb3BVcGxvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ecm9wVXBsb2FkZXIpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLkRyb3BVcGxvYWRlciA9IF9Ecm9wVXBsb2FkZXIyLmRlZmF1bHQ7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdDtcbiJdfQ==
