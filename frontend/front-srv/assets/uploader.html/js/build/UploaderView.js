(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.UploaderView = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename-folders', label: "Rename folders then files", style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename', label: "Rename files only (merge folders)", style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'overwrite', label: pydio.MessageHash['html_uploader.21'] })
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { display: 'flex', marginTop: 30, alignItems: 'center' } },
                        _react2.default.createElement(_materialUi.Checkbox, { label: "Save choice for next uploads", checked: saveValue, onCheck: this.checkChange.bind(this) }),
                        _react2.default.createElement('span', { style: { flex: 1 } }),
                        _react2.default.createElement(_materialUi.FlatButton, { label: "Cancel", onTouchTap: this.cancel.bind(this) }),
                        _react2.default.createElement(_materialUi.RaisedButton, { primary: true, label: "OK", onTouchTap: this.submit.bind(this) })
                    )
                )
            );
        }
    }]);

    return ConfirmExists;
}(_react2.default.Component);

exports.default = ConfirmExists;

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],2:[function(require,module,exports){
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
                items: store.getItems(),
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
            items: store.getItems(),
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
        key: 'clear',
        value: function clear(e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().clearAll();
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

            UploaderModel.Store.getInstance().getItems().sessions.forEach(function (session) {
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
            store.getItems().sessions.forEach(function (session) {
                if (session.getStatus() === 'confirm') {
                    store.removeSession(session);
                }
            });
            this.setState({ confirmDialog: false });
            _pydio2.default.getInstance().getController().fireAction('upload');
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var messages = _pydio2.default.getInstance().MessageHash;
            var connectDropTarget = this.props.connectDropTarget || function (c) {
                return c;
            };
            var _state2 = this.state,
                configs = _state2.configs,
                showOptions = _state2.showOptions,
                items = _state2.items,
                storeRunning = _state2.storeRunning,
                confirmDialog = _state2.confirmDialog;

            var store = UploaderModel.Store.getInstance();
            var listEmpty = true;
            items.sessions.forEach(function (s) {
                if (s.getChildren().length) {
                    listEmpty = false;
                }
            });
            var folderButton = void 0,
                startButton = void 0;
            var e = global.document.createElement('input');
            e.setAttribute('type', 'file');
            if ('webkitdirectory' in e) {
                folderButton = _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-folder-plus' }), primary: true, style: { marginRight: 10 }, label: messages['html_uploader.5'], onTouchTap: this.openFolderPicker.bind(this) });
            }
            e = null;

            if (storeRunning) {
                startButton = _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-pause' }), label: "Pause", onTouchTap: this.pause.bind(this), secondary: true });
            } else if (store.hasQueue()) {
                startButton = _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-play' }), label: messages['html_uploader.11'], onTouchTap: this.start.bind(this), secondary: true });
            }
            return connectDropTarget(_react2.default.createElement(
                'div',
                { style: { position: 'relative', backgroundColor: '#FAFAFA' } },
                _react2.default.createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: 6, width: '100%', height: '100%' } },
                    _react2.default.createElement(_materialUi.FlatButton, { icon: _react2.default.createElement(_materialUi.FontIcon, { style: { fontSize: 16 }, className: 'mdi mdi-file-plus' }), primary: true, style: { marginRight: 6 }, label: messages['html_uploader.4'], onTouchTap: this.openFilePicker.bind(this) }),
                    folderButton,
                    startButton,
                    _react2.default.createElement('span', { style: { flex: 1 } }),
                    !listEmpty && _react2.default.createElement(_materialUi.FlatButton, { label: messages['html_uploader.12'], style: { marginRight: 0 }, primary: true, onTouchTap: this.clear.bind(this) }),
                    _react2.default.createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical", iconStyle: { color: '#9e9e9e', fontSize: 18 }, style: { padding: 14 }, tooltip: messages['html_uploader.22'], onTouchTap: this.toggleOptions.bind(this) })
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
                        items: items,
                        autoStart: configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send'),
                        onDismiss: this.props.onDismiss
                    })
                ),
                _react2.default.createElement(_UploadOptionsPane2.default, { configs: configs, open: showOptions, anchorEl: this.state.optionsAnchorEl, onDismiss: function onDismiss(e) {
                        _this2.toggleOptions(e);
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

},{"./ConfirmExists":1,"./TransfersList":4,"./UploadOptionsPane":5,"material-ui":"material-ui","pydio":"pydio","react":"react"}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _materialUi = require('material-ui');

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
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                item = _props.item,
                className = _props.className,
                style = _props.style,
                limit = _props.limit,
                level = _props.level,
                extensions = _props.extensions;
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

            var styles = {
                main: _extends({}, style, {
                    fontSize: 14,
                    color: '#424242'
                }),
                line: {
                    paddingLeft: (level - 1) * 20,
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: 12,
                    paddingBottom: 12,
                    borderBottom: "1px solid #eeeeee",
                    backgroundColor: 'white',
                    cursor: children.length ? 'pointer' : 'default',
                    borderLeft: level === 1 ? '3px solid transparent' : ''
                },
                leftIcon: {
                    display: 'inline-block',
                    width: 36,
                    textAlign: 'center',
                    color: isPart ? '#9e9e9e' : '#616161',
                    fontSize: 16
                },
                previewImage: {
                    display: 'inline-block',
                    backgroundColor: '#eee',
                    backgroundSize: 'cover',
                    height: 24,
                    width: 24,
                    borderRadius: '50%'
                },
                label: {
                    fontWeight: isDir ? 500 : 400,
                    color: isPart ? '#9e9e9e' : null,
                    fontStyle: isPart ? 'italic' : null
                },
                pgBar: {
                    width: 80,
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
                if (open || isSession && status !== 'analyse') {
                    var sliced = showAll ? children : children.slice(0, limit);
                    childComps = sliced.map(function (child) {
                        return _react2.default.createElement(Transfer, {
                            key: child.getId(),
                            item: child,
                            limit: limit,
                            level: level + 1,
                            extensions: extensions
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
                                children.length - sliced.length,
                                ' more - show all'
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
                rightButton = _react2.default.createElement('span', { className: 'mdi mdi-delete', onClick: function onClick() {
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
                var _status = item.getStatus();
                iconClass = "mdi mdi-file";
                var ext = _path2.default.getFileExtension(item.getFullPath());
                if (extensions.has(ext)) {
                    var _extensions$get = extensions.get(ext),
                        fontIcon = _extensions$get.fontIcon;

                    iconClass = 'mimefont mdi mdi-' + fontIcon;
                }

                if (_status === 'loading') {
                    rightButton = _react2.default.createElement('span', { className: 'mdi mdi-stop', onClick: function onClick() {
                            return _this3.abort();
                        } });
                } else if (_status === 'error') {
                    pgColor = '#e53935';
                    rightButton = _react2.default.createElement('span', { className: "mdi mdi-restart", style: { color: '#e53935' }, onClick: function onClick() {
                            item.process(function () {});
                        } });
                } else {
                    pgColor = '#4caf50';
                    rightButton = _react2.default.createElement('span', { className: 'mdi mdi-delete', onClick: function onClick() {
                            _this3.remove();
                        } });
                }
            }

            var label = _path2.default.getBasename(item.getFullPath());
            var progressBar = _react2.default.createElement(_materialUi.LinearProgress, { style: { backgroundColor: '#eeeeee' }, color: pgColor, min: 0, max: 100, value: progress, mode: "determinate" });

            if (isSession) {
                if (status === 'analyse') {
                    label = "Preparing files and folders for upload...";
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
                leftIcon = _react2.default.createElement('span', { className: iconClass, style: styles.leftIcon });
            }

            return _react2.default.createElement(
                'div',
                { style: styles.main, className: "upload-" + status + " " + (className ? className : "") },
                _react2.default.createElement(
                    'div',
                    { style: styles.line },
                    leftIcon,
                    _react2.default.createElement(
                        'span',
                        { onClick: toggleCallback, style: styles.label },
                        label
                    ),
                    toggleOpen,
                    _react2.default.createElement('span', { style: { flex: 1 } }),
                    _react2.default.createElement(
                        'div',
                        { style: styles.pgBar },
                        progressBar
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

},{"material-ui":"material-ui","pydio/util/path":"pydio/util/path","react":"react"}],4:[function(require,module,exports){
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
            var components = [];
            var items = this.props.items;

            var isEmpty = true;
            if (items) {
                var ext = _pydio2.default.getInstance().Registry.getFilesExtensions();
                components = items.sessions.map(function (session) {
                    if (session.getChildren().length) {
                        isEmpty = false;
                    }
                    return _react2.default.createElement(_Transfer2.default, { item: session, style: {}, limit: 10, level: 0, extensions: ext });
                });
            }
            if (isEmpty) {
                return _react2.default.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', height: '100%', width: '100%' } },
                    _react2.default.createElement(
                        'div',
                        { style: { textAlign: 'center', width: '100%', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(0,0,0,0.1)', fontSize: 24 } },
                        'Drop Files Here'
                    )
                );
            }

            var container = {
                height: '100%',
                overflowY: 'auto',
                borderBottom: '1px solid #eeeeee'
            };

            return _react2.default.createElement(
                'div',
                { style: container },
                components
            );
        }
    }]);

    return TransfersList;
}(_react2.default.Component);

exports.default = TransfersList;

},{"./Transfer":3,"pydio":"pydio","react":"react"}],5:[function(require,module,exports){
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
                    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
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
                        pydio.MessageHash['html_uploader.18']
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { padding: 16, fontSize: 14, paddingTop: 0 } },
                        _react2.default.createElement(
                            _materialUi.RadioButtonGroup,
                            { ref: 'group', name: 'shipSpeed', defaultSelected: overwriteType, onChange: this.radioChange.bind(this) },
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'alert', label: pydio.MessageHash['html_uploader.19'], style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename-folders', label: "Rename folders then files", style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'rename', label: "Rename files only (merge folders)", style: { paddingBottom: 8 } }),
                            _react2.default.createElement(_materialUi.RadioButton, { value: 'overwrite', label: pydio.MessageHash['html_uploader.21'] })
                        )
                    )
                )
            );
        }
    }]);

    return UploadOptionsPane;
}(_react2.default.Component);

exports.default = UploadOptionsPane;

},{"material-ui":"material-ui","pydio":"pydio","react":"react"}],6:[function(require,module,exports){
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

},{"./DropUploader":2,"./TransfersList":4}]},{},[6])(6)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC92aWV3L0NvbmZpcm1FeGlzdHMuanMiLCJqcy9idWlsZC92aWV3L0Ryb3BVcGxvYWRlci5qcyIsImpzL2J1aWxkL3ZpZXcvVHJhbnNmZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyc0xpc3QuanMiLCJqcy9idWlsZC92aWV3L1VwbG9hZE9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIENvbmZpcm1FeGlzdHMgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhDb25maXJtRXhpc3RzLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIENvbmZpcm1FeGlzdHMocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbmZpcm1FeGlzdHMpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDb25maXJtRXhpc3RzLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ29uZmlybUV4aXN0cykpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLFxuICAgICAgICAgICAgc2F2ZVZhbHVlOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENvbmZpcm1FeGlzdHMsIFt7XG4gICAgICAgIGtleTogJ2NhbmNlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N1Ym1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9zdGF0ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICBzYXZlVmFsdWUgPSBfc3RhdGUuc2F2ZVZhbHVlO1xuXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ29uZmlybSh2YWx1ZSwgc2F2ZVZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2hlY2tDaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2hlY2tDaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzYXZlVmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyYWRpb0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWRpb0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfc3RhdGUyLnZhbHVlLFxuICAgICAgICAgICAgICAgIHNhdmVWYWx1ZSA9IF9zdGF0ZTIuc2F2ZVZhbHVlO1xuXG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCB0b3A6IDQ5LCBsZWZ0OiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNyknIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDUwMCwgcGFkZGluZzogMTYsIGZvbnRTaXplOiAxNCwgbWFyZ2luOiAnMCBhdXRvJyB9LCB6RGVwdGg6IDIgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaDUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbMTI0XVxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IHZhbHVlLCBvbkNoYW5nZTogdGhpcy5yYWRpb0NoYW5nZS5iaW5kKHRoaXMpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdyZW5hbWUtZm9sZGVycycsIGxhYmVsOiBcIlJlbmFtZSBmb2xkZXJzIHRoZW4gZmlsZXNcIiwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lJywgbGFiZWw6IFwiUmVuYW1lIGZpbGVzIG9ubHkgKG1lcmdlIGZvbGRlcnMpXCIsIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci4yMSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luVG9wOiAzMCwgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgbGFiZWw6IFwiU2F2ZSBjaG9pY2UgZm9yIG5leHQgdXBsb2Fkc1wiLCBjaGVja2VkOiBzYXZlVmFsdWUsIG9uQ2hlY2s6IHRoaXMuY2hlY2tDaGFuZ2UuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBcIkNhbmNlbFwiLCBvblRvdWNoVGFwOiB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFpc2VkQnV0dG9uLCB7IHByaW1hcnk6IHRydWUsIGxhYmVsOiBcIk9LXCIsIG9uVG91Y2hUYXA6IHRoaXMuc3VibWl0LmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ29uZmlybUV4aXN0cztcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENvbmZpcm1FeGlzdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfVXBsb2FkT3B0aW9uc1BhbmUgPSByZXF1aXJlKCcuL1VwbG9hZE9wdGlvbnNQYW5lJyk7XG5cbnZhciBfVXBsb2FkT3B0aW9uc1BhbmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVXBsb2FkT3B0aW9uc1BhbmUpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG52YXIgX0NvbmZpcm1FeGlzdHMgPSByZXF1aXJlKCcuL0NvbmZpcm1FeGlzdHMnKTtcblxudmFyIF9Db25maXJtRXhpc3RzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NvbmZpcm1FeGlzdHMpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKCdob2MnKSxcbiAgICBkcm9wUHJvdmlkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5kcm9wUHJvdmlkZXI7XG5cbnZhciBfUHlkaW8kcmVxdWlyZUxpYjIgPSBfcHlkaW8yLmRlZmF1bHQucmVxdWlyZUxpYignZm9ybScpLFxuICAgIEZpbGVEcm9wWm9uZSA9IF9QeWRpbyRyZXF1aXJlTGliMi5GaWxlRHJvcFpvbmU7XG5cbnZhciBEcm9wVXBsb2FkZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEcm9wVXBsb2FkZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRHJvcFVwbG9hZGVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEcm9wVXBsb2FkZXIpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChEcm9wVXBsb2FkZXIuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihEcm9wVXBsb2FkZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBfdGhpcy5fc3RvcmVPYnNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpdGVtczogc3RvcmUuZ2V0SXRlbXMoKSxcbiAgICAgICAgICAgICAgICBzdG9yZVJ1bm5pbmc6IHN0b3JlLmlzUnVubmluZygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgc3RvcmUub2JzZXJ2ZShcInVwZGF0ZVwiLCBfdGhpcy5fc3RvcmVPYnNlcnZlcik7XG4gICAgICAgIHN0b3JlLm9ic2VydmUoXCJhdXRvX2Nsb3NlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5wcm9wcy5vbkRpc21pc3MpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93T3B0aW9uczogZmFsc2UsXG4gICAgICAgICAgICBjb25maWdzOiBVcGxvYWRlck1vZGVsLkNvbmZpZ3MuZ2V0SW5zdGFuY2UoKSxcbiAgICAgICAgICAgIGl0ZW1zOiBzdG9yZS5nZXRJdGVtcygpLFxuICAgICAgICAgICAgc3RvcmVSdW5uaW5nOiBzdG9yZS5pc1J1bm5pbmcoKSxcbiAgICAgICAgICAgIGNvbmZpcm1EaWFsb2c6IHByb3BzLmNvbmZpcm1EaWFsb2dcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEcm9wVXBsb2FkZXIsIFt7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgICAgIGlmIChuZXh0UHJvcHMuY29uZmlybURpYWxvZyAhPT0gdGhpcy5zdGF0ZS5jb25maXJtRGlhbG9nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IG5leHRQcm9wcy5jb25maXJtRGlhbG9nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdG9yZU9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnN0b3BPYnNlcnZpbmcoXCJ1cGRhdGVcIiwgdGhpcy5fc3RvcmVPYnNlcnZlcik7XG4gICAgICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnN0b3BPYnNlcnZpbmcoXCJhdXRvX2Nsb3NlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkRyb3AnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Ecm9wKGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dE5vZGUgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0Q29udGV4dE5vZGUoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5oYW5kbGVEcm9wRXZlbnRSZXN1bHRzKG51bGwsIGZpbGVzLCBjb250ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uRm9sZGVyUGlja2VkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRm9sZGVyUGlja2VkKGZpbGVzKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dE5vZGUgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0Q29udGV4dE5vZGUoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5oYW5kbGVGb2xkZXJQaWNrZXJSZXN1bHQoZmlsZXMsIGNvbnRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3RhcnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3RhcnQoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnJlc3VtZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwYXVzZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZShlKSB7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY2xlYXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmNsZWFyQWxsKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3RvZ2dsZU9wdGlvbnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdG9nZ2xlT3B0aW9ucyhlKSB7XG4gICAgICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICBfc3RhdGUkc2hvd09wdGlvbnMgPSBfc3RhdGUuc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnMgPSBfc3RhdGUkc2hvd09wdGlvbnMgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3N0YXRlJHNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQgPSBfc3RhdGUuY3VycmVudFRhcmdldDtcblxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBzaG93T3B0aW9uczogIXNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNBbmNob3JFbDogZS5jdXJyZW50VGFyZ2V0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb3BlbkZpbGVQaWNrZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkZpbGVQaWNrZXIoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5yZWZzLmRyb3B6b25lLm9wZW4oKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb3BlbkZvbGRlclBpY2tlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRm9sZGVyUGlja2VyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucmVmcy5kcm9wem9uZS5vcGVuRm9sZGVyUGlja2VyKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RpYWxvZ1N1Ym1pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaWFsb2dTdWJtaXQobmV3VmFsdWUsIHNhdmVWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnN0YXRlLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5nZXRJdGVtcygpLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRTdGF0dXMoKSA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24ucHJlcGFyZShuZXdWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoc2F2ZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9leGlzdGluZycsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb25maXJtRGlhbG9nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKCd1cGxvYWQnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlhbG9nQ2FuY2VsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpYWxvZ0NhbmNlbCgpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHN0b3JlLmdldEl0ZW1zKCkuc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldFN0YXR1cygpID09PSAnY29uZmlybScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUucmVtb3ZlU2Vzc2lvbihzZXNzaW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb25maXJtRGlhbG9nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKCd1cGxvYWQnKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaDtcbiAgICAgICAgICAgIHZhciBjb25uZWN0RHJvcFRhcmdldCA9IHRoaXMucHJvcHMuY29ubmVjdERyb3BUYXJnZXQgfHwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgY29uZmlncyA9IF9zdGF0ZTIuY29uZmlncyxcbiAgICAgICAgICAgICAgICBzaG93T3B0aW9ucyA9IF9zdGF0ZTIuc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBfc3RhdGUyLml0ZW1zLFxuICAgICAgICAgICAgICAgIHN0b3JlUnVubmluZyA9IF9zdGF0ZTIuc3RvcmVSdW5uaW5nLFxuICAgICAgICAgICAgICAgIGNvbmZpcm1EaWFsb2cgPSBfc3RhdGUyLmNvbmZpcm1EaWFsb2c7XG5cbiAgICAgICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHZhciBsaXN0RW1wdHkgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbXMuc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgICAgIGlmIChzLmdldENoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGZvbGRlckJ1dHRvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBzdGFydEJ1dHRvbiA9IHZvaWQgMDtcbiAgICAgICAgICAgIHZhciBlID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICBlLnNldEF0dHJpYnV0ZSgndHlwZScsICdmaWxlJyk7XG4gICAgICAgICAgICBpZiAoJ3dlYmtpdGRpcmVjdG9yeScgaW4gZSkge1xuICAgICAgICAgICAgICAgIGZvbGRlckJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktZm9sZGVyLXBsdXMnIH0pLCBwcmltYXJ5OiB0cnVlLCBzdHlsZTogeyBtYXJnaW5SaWdodDogMTAgfSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjUnXSwgb25Ub3VjaFRhcDogdGhpcy5vcGVuRm9sZGVyUGlja2VyLmJpbmQodGhpcykgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKHN0b3JlUnVubmluZykge1xuICAgICAgICAgICAgICAgIHN0YXJ0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1wYXVzZScgfSksIGxhYmVsOiBcIlBhdXNlXCIsIG9uVG91Y2hUYXA6IHRoaXMucGF1c2UuYmluZCh0aGlzKSwgc2Vjb25kYXJ5OiB0cnVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdG9yZS5oYXNRdWV1ZSgpKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLXBsYXknIH0pLCBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuMTEnXSwgb25Ub3VjaFRhcDogdGhpcy5zdGFydC5iaW5kKHRoaXMpLCBzZWNvbmRhcnk6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29ubmVjdERyb3BUYXJnZXQoX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgYmFja2dyb3VuZENvbG9yOiAnI0ZBRkFGQScgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyB6RGVwdGg6IDEsIHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBwYWRkaW5nTGVmdDogNiwgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLWZpbGUtcGx1cycgfSksIHByaW1hcnk6IHRydWUsIHN0eWxlOiB7IG1hcmdpblJpZ2h0OiA2IH0sIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci40J10sIG9uVG91Y2hUYXA6IHRoaXMub3BlbkZpbGVQaWNrZXIuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyQnV0dG9uLFxuICAgICAgICAgICAgICAgICAgICBzdGFydEJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgIWxpc3RFbXB0eSAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci4xMiddLCBzdHlsZTogeyBtYXJnaW5SaWdodDogMCB9LCBwcmltYXJ5OiB0cnVlLCBvblRvdWNoVGFwOiB0aGlzLmNsZWFyLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWRvdHMtdmVydGljYWxcIiwgaWNvblN0eWxlOiB7IGNvbG9yOiAnIzllOWU5ZScsIGZvbnRTaXplOiAxOCB9LCBzdHlsZTogeyBwYWRkaW5nOiAxNCB9LCB0b29sdGlwOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci4yMiddLCBvblRvdWNoVGFwOiB0aGlzLnRvZ2dsZU9wdGlvbnMuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIEZpbGVEcm9wWm9uZSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndHJhbnNwYXJlbnQtZHJvcHpvbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnZHJvcHpvbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVGb2xkZXJzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydENsaWNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlnbm9yZU5hdGl2ZURyb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRyb3A6IHRoaXMub25Ecm9wLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZvbGRlclBpY2tlZDogdGhpcy5vbkZvbGRlclBpY2tlZC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiA0MjAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1N0YXJ0OiBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRGlzbWlzczogdGhpcy5wcm9wcy5vbkRpc21pc3NcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9VcGxvYWRPcHRpb25zUGFuZTIuZGVmYXVsdCwgeyBjb25maWdzOiBjb25maWdzLCBvcGVuOiBzaG93T3B0aW9ucywgYW5jaG9yRWw6IHRoaXMuc3RhdGUub3B0aW9uc0FuY2hvckVsLCBvbkRpc21pc3M6IGZ1bmN0aW9uIG9uRGlzbWlzcyhlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIudG9nZ2xlT3B0aW9ucyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICBjb25maXJtRGlhbG9nICYmIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9Db25maXJtRXhpc3RzMi5kZWZhdWx0LCB7IG9uQ29uZmlybTogdGhpcy5kaWFsb2dTdWJtaXQuYmluZCh0aGlzKSwgb25DYW5jZWw6IHRoaXMuZGlhbG9nQ2FuY2VsLmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERyb3BVcGxvYWRlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IERyb3BVcGxvYWRlciA9IGRyb3BQcm92aWRlcihEcm9wVXBsb2FkZXIpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEcm9wVXBsb2FkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciB1cGxvYWRTdGF0dXNNZXNzYWdlcyA9IHtcbiAgICBcIm5ld1wiOiA0MzMsXG4gICAgXCJsb2FkaW5nXCI6IDQzNCxcbiAgICBcImxvYWRlZFwiOiA0MzUsXG4gICAgXCJlcnJvclwiOiA0MzZcbn07XG5cbnZhciBUcmFuc2ZlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFRyYW5zZmVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2Zlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBbGw6IGZhbHNlLFxuICAgICAgICAgICAgc3RhdHVzOiBwcm9wcy5pdGVtLmdldFN0YXR1cygpLFxuICAgICAgICAgICAgcHJldmlld1VybDogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiBwcm9wcy5pdGVtLmdldFByb2dyZXNzKCkgfHwgMFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRyYW5zZmVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgdGhpcy5fcGdPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHN0YXR1czogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLm9ic2VydmUoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuVXBsb2FkSXRlbSAmJiAvXFwuKGpwZT9nfHBuZ3xnaWYpJC9pLnRlc3QoaXRlbS5nZXRGaWxlKCkubmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcmV2aWV3VXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcmV2aWV3VXJsOiBpdGVtLnByZXZpZXdVcmwgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wcmV2aWV3VXJsID0gcmVhZGVyLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHJldmlld1VybDogcmVhZGVyLnJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaXRlbS5nZXRGaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3Byb2dyZXNzJywgdGhpcy5fcGdPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3N0YXR1cycsIHRoaXMuX3N0YXR1c09ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXRQYXJlbnQoKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIGl0ZW0uYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBpdGVtID0gX3Byb3BzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gX3Byb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IF9wcm9wcy5zdHlsZSxcbiAgICAgICAgICAgICAgICBsaW1pdCA9IF9wcm9wcy5saW1pdCxcbiAgICAgICAgICAgICAgICBsZXZlbCA9IF9wcm9wcy5sZXZlbCxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zID0gX3Byb3BzLmV4dGVuc2lvbnM7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcGVuID0gX3N0YXRlLm9wZW4sXG4gICAgICAgICAgICAgICAgc2hvd0FsbCA9IF9zdGF0ZS5zaG93QWxsLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gX3N0YXRlLnByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHN0YXR1cyA9IF9zdGF0ZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgcHJldmlld1VybCA9IF9zdGF0ZS5wcmV2aWV3VXJsO1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBpdGVtLmdldENoaWxkcmVuKCk7XG4gICAgICAgICAgICB2YXIgaXNEaXIgPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5Gb2xkZXJJdGVtO1xuICAgICAgICAgICAgdmFyIGlzUGFydCA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlBhcnRJdGVtO1xuICAgICAgICAgICAgdmFyIGlzU2Vzc2lvbiA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlNlc3Npb247XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgbWFpbjogX2V4dGVuZHMoe30sIHN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNDI0MjQyJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IChsZXZlbCAtIDEpICogMjAsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6IDEyLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAxMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCAjZWVlZWVlXCIsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBjaGlsZHJlbi5sZW5ndGggPyAncG9pbnRlcicgOiAnZGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6IGxldmVsID09PSAxID8gJzNweCBzb2xpZCB0cmFuc3BhcmVudCcgOiAnJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVmdEljb246IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzNixcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6ICcjNjE2MTYxJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3SW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogJ2NvdmVyJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyNCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBpc0RpciA/IDUwMCA6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogaXNQYXJ0ID8gJ2l0YWxpYycgOiBudWxsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwZ0Jhcjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogODAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbjoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDQ4LFxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjOWU5ZTllJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2dnbGVJY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IDRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRDb21wcyA9IFtdLFxuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHBnQ29sb3IgPSB2b2lkIDA7XG5cbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAob3BlbiB8fCBpc1Nlc3Npb24gJiYgc3RhdHVzICE9PSAnYW5hbHlzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNsaWNlZCA9IHNob3dBbGwgPyBjaGlsZHJlbiA6IGNoaWxkcmVuLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRDb21wcyA9IHNsaWNlZC5tYXAoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoVHJhbnNmZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGNoaWxkLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uczogZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc2xpY2VkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRDb21wcy5wdXNoKF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHt9LCBzdHlsZXMubGluZSwgeyBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyTGVmdDogJycsIHBhZGRpbmdMZWZ0OiBsZXZlbCAqIDIwIH0pLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgc2hvd0FsbDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogc3R5bGVzLmxlZnRJY29uLCBjbGFzc05hbWU6IFwibWRpIG1kaS1wbHVzLWJveC1vdXRsaW5lXCIgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBmbGV4OiAxLCBmb250U3R5bGU6ICdpdGFsaWMnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ubGVuZ3RoIC0gc2xpY2VkLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBtb3JlIC0gc2hvdyBhbGwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSBmdW5jdGlvbiB0b2dnbGVDYWxsYmFjaygpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnNldFN0YXRlKHsgb3BlbjogIW9wZW4gfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IG9uQ2xpY2s6IHRvZ2dsZUNhbGxiYWNrLCBzdHlsZTogc3R5bGVzLnRvZ2dsZUljb24sIGNsYXNzTmFtZTogXCJtZGkgbWRpLWNoZXZyb24tXCIgKyAob3BlbiA/IFwiZG93blwiIDogXCJyaWdodFwiKSB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzRGlyKSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLWZvbGRlclwiO1xuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZGVsZXRlJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQYXJ0KSB7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLXBhY2thZ2UtdXBcIjtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPT09IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIF9zdGF0dXMgPSBpdGVtLmdldFN0YXR1cygpO1xuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IFwibWRpIG1kaS1maWxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIGV4dCA9IF9wYXRoMi5kZWZhdWx0LmdldEZpbGVFeHRlbnNpb24oaXRlbS5nZXRGdWxsUGF0aCgpKTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5oYXMoZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2V4dGVuc2lvbnMkZ2V0ID0gZXh0ZW5zaW9ucy5nZXQoZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRJY29uID0gX2V4dGVuc2lvbnMkZ2V0LmZvbnRJY29uO1xuXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzcyA9ICdtaW1lZm9udCBtZGkgbWRpLScgKyBmb250SWNvbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoX3N0YXR1cyA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktc3RvcCcsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKF9zdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjZTUzOTM1JztcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBcIm1kaSBtZGktcmVzdGFydFwiLCBzdHlsZTogeyBjb2xvcjogJyNlNTM5MzUnIH0sIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5wcm9jZXNzKGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjNGNhZjUwJztcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBfcGF0aDIuZGVmYXVsdC5nZXRCYXNlbmFtZShpdGVtLmdldEZ1bGxQYXRoKCkpO1xuICAgICAgICAgICAgdmFyIHByb2dyZXNzQmFyID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTGluZWFyUHJvZ3Jlc3MsIHsgc3R5bGU6IHsgYmFja2dyb3VuZENvbG9yOiAnI2VlZWVlZScgfSwgY29sb3I6IHBnQ29sb3IsIG1pbjogMCwgbWF4OiAxMDAsIHZhbHVlOiBwcm9ncmVzcywgbW9kZTogXCJkZXRlcm1pbmF0ZVwiIH0pO1xuXG4gICAgICAgICAgICBpZiAoaXNTZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2FuYWx5c2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gXCJQcmVwYXJpbmcgZmlsZXMgYW5kIGZvbGRlcnMgZm9yIHVwbG9hZC4uLlwiO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBzaXplOiAxNiwgdGhpY2tuZXNzOiAyLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDEgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5sZWZ0SWNvbiwgeyBtYXJnaW5Ub3A6IC00LCBtYXJnaW5Cb3R0b206IC01IH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBfZXh0ZW5kcyh7IGJhY2tncm91bmQ6ICd1cmwoJyArIHByZXZpZXdVcmwgKyAnKScgfSwgc3R5bGVzLnByZXZpZXdJbWFnZSkgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGljb25DbGFzcywgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5tYWluLCBjbGFzc05hbWU6IFwidXBsb2FkLVwiICsgc3RhdHVzICsgXCIgXCIgKyAoY2xhc3NOYW1lID8gY2xhc3NOYW1lIDogXCJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5saW5lIH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZnRJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMucGdCYXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLnJpZ2h0QnV0dG9uIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRyYW5zZmVyO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVHJhbnNmZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfVHJhbnNmZXIgPSByZXF1aXJlKCcuL1RyYW5zZmVyJyk7XG5cbnZhciBfVHJhbnNmZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNmZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBUcmFuc2ZlcnNMaXN0ID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVHJhbnNmZXJzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2ZlcnNMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2ZlcnNMaXN0KTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyc0xpc3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUcmFuc2ZlcnNMaXN0KSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlcnNMaXN0LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuaXRlbXM7XG5cbiAgICAgICAgICAgIHZhciBpc0VtcHR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gaXRlbXMuc2Vzc2lvbnMubWFwKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldENoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9UcmFuc2ZlcjIuZGVmYXVsdCwgeyBpdGVtOiBzZXNzaW9uLCBzdHlsZToge30sIGxpbWl0OiAxMCwgbGV2ZWw6IDAsIGV4dGVuc2lvbnM6IGV4dCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBoZWlnaHQ6ICcxMDAlJywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIHdpZHRoOiAnMTAwJScsIGZvbnRXZWlnaHQ6IDUwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjEpJywgZm9udFNpemU6IDI0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdEcm9wIEZpbGVzIEhlcmUnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93WTogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZWVlZWVlJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IGNvbnRhaW5lciB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVHJhbnNmZXJzTGlzdDtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyc0xpc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIFVwbG9hZE9wdGlvbnNQYW5lID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVXBsb2FkT3B0aW9uc1BhbmUsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVXBsb2FkT3B0aW9uc1BhbmUoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVcGxvYWRPcHRpb25zUGFuZSk7XG5cbiAgICAgICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChVcGxvYWRPcHRpb25zUGFuZS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFVwbG9hZE9wdGlvbnNQYW5lKSkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFVwbG9hZE9wdGlvbnNQYW5lLCBbe1xuICAgICAgICBrZXk6ICd1cGRhdGVGaWVsZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVGaWVsZChmTmFtZSwgZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5jb25maWdzO1xuXG5cbiAgICAgICAgICAgIGlmIChmTmFtZSA9PT0gJ2F1dG9zdGFydCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTdGFydCA9ICF0b2dnbGVTdGFydDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2F1dG9fc2VuZCcsIHRvZ2dsZVN0YXJ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdhdXRvY2xvc2UnKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90b2dnbGVTdGFydCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fQ0xPU0UnLCAndXBsb2FkX2F1dG9fY2xvc2UnLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBfdG9nZ2xlU3RhcnQgPSAhX3RvZ2dsZVN0YXJ0O1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfYXV0b19jbG9zZScsIF90b2dnbGVTdGFydCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnZXhpc3RpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9leGlzdGluZycsIGV2ZW50LnRhcmdldC5nZXRTZWxlY3RlZFZhbHVlKCkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ3Nob3dfcHJvY2Vzc2VkJykge1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGVTaG93UHJvY2Vzc2VkID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ1VQTE9BRF9TSE9XX1BST0NFU1NFRCcsICd1cGxvYWRfc2hvd19wcm9jZXNzZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlU2hvd1Byb2Nlc3NlZCA9ICF0b2dnbGVTaG93UHJvY2Vzc2VkO1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfc2hvd19wcm9jZXNzZWQnLCB0b2dnbGVTaG93UHJvY2Vzc2VkLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByYW5kb206IE1hdGgucmFuZG9tKCkgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JhZGlvQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJhZGlvQ2hhbmdlKGUsIG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMucHJvcHMuY29uZmlncztcblxuXG4gICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2V4aXN0aW5nJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJhbmRvbTogTWF0aC5yYW5kb20oKSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMucHJvcHMuY29uZmlncztcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgICAgIHZhciB0b2dnbGVTdGFydCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fU1RBUlQnLCAndXBsb2FkX2F1dG9fc2VuZCcpO1xuICAgICAgICAgICAgdmFyIHRvZ2dsZUNsb3NlID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19DTE9TRScsICd1cGxvYWRfYXV0b19jbG9zZScpO1xuICAgICAgICAgICAgdmFyIG92ZXJ3cml0ZVR5cGUgPSBjb25maWdzLmdldE9wdGlvbignREVGQVVMVF9FWElTVElORycsICd1cGxvYWRfZXhpc3RpbmcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBvcG92ZXIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBvcGVuOiB0aGlzLnByb3BzLm9wZW4sXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvckVsOiB0aGlzLnByb3BzLmFuY2hvckVsLFxuICAgICAgICAgICAgICAgICAgICBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICdib3R0b20nIH0sXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ3RvcCcgfSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IGZ1bmN0aW9uIG9uUmVxdWVzdENsb3NlKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogMzIwLCBwYWRkaW5nQm90dG9tOiA2IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5TdWJoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ09wdGlvbnMnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDE2cHgnLCBtYXJnaW5Ub3A6IC02IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IHN0eWxlOiB7IG1hcmdpbjogJzhweCAwJyB9LCBjaGVja2VkOiB0b2dnbGVTdGFydCwgbGFiZWxQb3NpdGlvbjogXCJyaWdodFwiLCBvbkNoZWNrOiB0aGlzLnVwZGF0ZUZpZWxkLmJpbmQodGhpcywgJ2F1dG9zdGFydCcpLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbMzM3XSwgbGFiZWxTdHlsZTogeyBmb250U2l6ZTogMTQgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IHN0eWxlOiB7IG1hcmdpbjogJzhweCAwJyB9LCBjaGVja2VkOiB0b2dnbGVDbG9zZSwgbGFiZWxQb3NpdGlvbjogXCJyaWdodFwiLCBvbkNoZWNrOiB0aGlzLnVwZGF0ZUZpZWxkLmJpbmQodGhpcywgJ2F1dG9jbG9zZScpLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbMzM4XSwgbGFiZWxTdHlsZTogeyBmb250U2l6ZTogMTQgfSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci4xOCddXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIHBhZGRpbmdUb3A6IDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUmFkaW9CdXR0b25Hcm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ2dyb3VwJywgbmFtZTogJ3NoaXBTcGVlZCcsIGRlZmF1bHRTZWxlY3RlZDogb3ZlcndyaXRlVHlwZSwgb25DaGFuZ2U6IHRoaXMucmFkaW9DaGFuZ2UuYmluZCh0aGlzKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAnYWxlcnQnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuMTknXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogXCJSZW5hbWUgZm9sZGVycyB0aGVuIGZpbGVzXCIsIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBcIlJlbmFtZSBmaWxlcyBvbmx5IChtZXJnZSBmb2xkZXJzKVwiLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdvdmVyd3JpdGUnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuMjEnXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVcGxvYWRPcHRpb25zUGFuZTtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFVwbG9hZE9wdGlvbnNQYW5lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5UcmFuc2ZlcnNMaXN0ID0gZXhwb3J0cy5Ecm9wVXBsb2FkZXIgPSB1bmRlZmluZWQ7XG5cbnZhciBfRHJvcFVwbG9hZGVyID0gcmVxdWlyZSgnLi9Ecm9wVXBsb2FkZXInKTtcblxudmFyIF9Ecm9wVXBsb2FkZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfRHJvcFVwbG9hZGVyKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0ID0gcmVxdWlyZSgnLi9UcmFuc2ZlcnNMaXN0Jyk7XG5cbnZhciBfVHJhbnNmZXJzTGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9UcmFuc2ZlcnNMaXN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5Ecm9wVXBsb2FkZXIgPSBfRHJvcFVwbG9hZGVyMi5kZWZhdWx0O1xuZXhwb3J0cy5UcmFuc2ZlcnNMaXN0ID0gX1RyYW5zZmVyc0xpc3QyLmRlZmF1bHQ7XG4iXX0=
