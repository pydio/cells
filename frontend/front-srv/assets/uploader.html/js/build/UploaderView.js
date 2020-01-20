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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

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
                    fontStyle: isPart ? 'italic' : null,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1
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
                        label,
                        ' ',
                        toggleOpen
                    ),
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

},{"material-ui":"material-ui","pydio":"pydio","pydio/util/path":"pydio/util/path","react":"react"}],4:[function(require,module,exports){
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
                        _pydio2.default.getMessages()["html_uploader.drophere"]
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC92aWV3L0NvbmZpcm1FeGlzdHMuanMiLCJqcy9idWlsZC92aWV3L0Ryb3BVcGxvYWRlci5qcyIsImpzL2J1aWxkL3ZpZXcvVHJhbnNmZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyc0xpc3QuanMiLCJqcy9idWlsZC92aWV3L1VwbG9hZE9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBDb25maXJtRXhpc3RzID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ29uZmlybUV4aXN0cywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDb25maXJtRXhpc3RzKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25maXJtRXhpc3RzKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQ29uZmlybUV4aXN0cy5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbmZpcm1FeGlzdHMpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2YWx1ZTogJ3JlbmFtZS1mb2xkZXJzJyxcbiAgICAgICAgICAgIHNhdmVWYWx1ZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb25maXJtRXhpc3RzLCBbe1xuICAgICAgICBrZXk6ICdjYW5jZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgc2F2ZVZhbHVlID0gX3N0YXRlLnNhdmVWYWx1ZTtcblxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0odmFsdWUsIHNhdmVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrQ2hhbmdlKGUsIG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2F2ZVZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmFkaW9DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmFkaW9DaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3N0YXRlMi52YWx1ZSxcbiAgICAgICAgICAgICAgICBzYXZlVmFsdWUgPSBfc3RhdGUyLnNhdmVWYWx1ZTtcblxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgcGFkZGluZzogMTYsIGZvbnRTaXplOiAxNCwgdG9wOiA0OSwgbGVmdDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjcpJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiA1MDAsIHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIG1hcmdpbjogJzAgYXV0bycgfSwgekRlcHRoOiAyIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWzEyNF1cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbkdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVmOiAnZ3JvdXAnLCBuYW1lOiAnc2hpcFNwZWVkJywgZGVmYXVsdFNlbGVjdGVkOiB2YWx1ZSwgb25DaGFuZ2U6IHRoaXMucmFkaW9DaGFuZ2UuYmluZCh0aGlzKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5yZW5hbWUuYWxsJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLnJlbmFtZS5tZXJnZSddLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdvdmVyd3JpdGUnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5vdmVyd3JpdGUnXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpblRvcDogMzAsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLnNhdmUuY2hvaWNlJ10sIGNoZWNrZWQ6IHNhdmVWYWx1ZSwgb25DaGVjazogdGhpcy5jaGVja0NoYW5nZS5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzU0XSwgb25Ub3VjaFRhcDogdGhpcy5jYW5jZWwuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBwcmltYXJ5OiB0cnVlLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbNDhdLCBvblRvdWNoVGFwOiB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbmZpcm1FeGlzdHM7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBDb25maXJtRXhpc3RzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1VwbG9hZE9wdGlvbnNQYW5lID0gcmVxdWlyZSgnLi9VcGxvYWRPcHRpb25zUGFuZScpO1xuXG52YXIgX1VwbG9hZE9wdGlvbnNQYW5lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZE9wdGlvbnNQYW5lKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0ID0gcmVxdWlyZSgnLi9UcmFuc2ZlcnNMaXN0Jyk7XG5cbnZhciBfVHJhbnNmZXJzTGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9UcmFuc2ZlcnNMaXN0KTtcblxudmFyIF9Db25maXJtRXhpc3RzID0gcmVxdWlyZSgnLi9Db25maXJtRXhpc3RzJyk7XG5cbnZhciBfQ29uZmlybUV4aXN0czIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Db25maXJtRXhpc3RzKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yLmRlZmF1bHQucmVxdWlyZUxpYignaG9jJyksXG4gICAgZHJvcFByb3ZpZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuZHJvcFByb3ZpZGVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoJ2Zvcm0nKSxcbiAgICBGaWxlRHJvcFpvbmUgPSBfUHlkaW8kcmVxdWlyZUxpYjIuRmlsZURyb3Bab25lO1xuXG52YXIgRHJvcFVwbG9hZGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRHJvcFVwbG9hZGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERyb3BVcGxvYWRlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcFVwbG9hZGVyKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRHJvcFVwbG9hZGVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRHJvcFVwbG9hZGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgX3RoaXMuX3N0b3JlT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHN0b3JlLmdldEl0ZW1zKCksXG4gICAgICAgICAgICAgICAgc3RvcmVSdW5uaW5nOiBzdG9yZS5pc1J1bm5pbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHN0b3JlLm9ic2VydmUoXCJ1cGRhdGVcIiwgX3RoaXMuX3N0b3JlT2JzZXJ2ZXIpO1xuICAgICAgICBzdG9yZS5vYnNlcnZlKFwiYXV0b19jbG9zZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMucHJvcHMub25EaXNtaXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvd09wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlnczogVXBsb2FkZXJNb2RlbC5Db25maWdzLmdldEluc3RhbmNlKCksXG4gICAgICAgICAgICBpdGVtczogc3RvcmUuZ2V0SXRlbXMoKSxcbiAgICAgICAgICAgIHN0b3JlUnVubmluZzogc3RvcmUuaXNSdW5uaW5nKCksXG4gICAgICAgICAgICBjb25maXJtRGlhbG9nOiBwcm9wcy5jb25maXJtRGlhbG9nXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRHJvcFVwbG9hZGVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmNvbmZpcm1EaWFsb2cgIT09IHRoaXMuc3RhdGUuY29uZmlybURpYWxvZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb25maXJtRGlhbG9nOiBuZXh0UHJvcHMuY29uZmlybURpYWxvZyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmVPYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIsIHRoaXMuX3N0b3JlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5zdG9wT2JzZXJ2aW5nKFwiYXV0b19jbG9zZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Ecm9wJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRHJvcChmaWxlcykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuaGFuZGxlRHJvcEV2ZW50UmVzdWx0cyhudWxsLCBmaWxlcywgY29udGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkZvbGRlclBpY2tlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkZvbGRlclBpY2tlZChmaWxlcykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuaGFuZGxlRm9sZGVyUGlja2VyUmVzdWx0KGZpbGVzLCBjb250ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0YXJ0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5yZXN1bWUoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoZSkge1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5jbGVhckFsbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0b2dnbGVPcHRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZU9wdGlvbnMoZSkge1xuICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgX3N0YXRlJHNob3dPcHRpb25zID0gX3N0YXRlLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zID0gX3N0YXRlJHNob3dPcHRpb25zID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9zdGF0ZSRzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0ID0gX3N0YXRlLmN1cnJlbnRUYXJnZXQ7XG5cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnM6ICFzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zQW5jaG9yRWw6IGUuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5GaWxlUGlja2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5GaWxlUGlja2VyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucmVmcy5kcm9wem9uZS5vcGVuKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5Gb2xkZXJQaWNrZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkZvbGRlclBpY2tlcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuZHJvcHpvbmUub3BlbkZvbGRlclBpY2tlcigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaWFsb2dTdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlhbG9nU3VibWl0KG5ld1ZhbHVlLCBzYXZlVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuZ2V0SXRlbXMoKS5zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb24uZ2V0U3RhdHVzKCkgPT09ICdjb25maXJtJykge1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnByZXBhcmUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNhdmVWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RpYWxvZ0NhbmNlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaWFsb2dDYW5jZWwoKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBzdG9yZS5nZXRJdGVtcygpLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRTdGF0dXMoKSA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJlbW92ZVNlc3Npb24oc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICB2YXIgY29ubmVjdERyb3BUYXJnZXQgPSB0aGlzLnByb3BzLmNvbm5lY3REcm9wVGFyZ2V0IHx8IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3MgPSBfc3RhdGUyLmNvbmZpZ3MsXG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnMgPSBfc3RhdGUyLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gX3N0YXRlMi5pdGVtcyxcbiAgICAgICAgICAgICAgICBzdG9yZVJ1bm5pbmcgPSBfc3RhdGUyLnN0b3JlUnVubmluZyxcbiAgICAgICAgICAgICAgICBjb25maXJtRGlhbG9nID0gX3N0YXRlMi5jb25maXJtRGlhbG9nO1xuXG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICB2YXIgbGlzdEVtcHR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGl0ZW1zLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocy5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0RW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBmb2xkZXJCdXR0b24gPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgc3RhcnRCdXR0b24gPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuICAgICAgICAgICAgaWYgKCd3ZWJraXRkaXJlY3RvcnknIGluIGUpIHtcbiAgICAgICAgICAgICAgICBmb2xkZXJCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLWZvbGRlci1wbHVzJyB9KSwgcHJpbWFyeTogdHJ1ZSwgc3R5bGU6IHsgbWFyZ2luUmlnaHQ6IDEwIH0sIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci41J10sIG9uVG91Y2hUYXA6IHRoaXMub3BlbkZvbGRlclBpY2tlci5iaW5kKHRoaXMpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChzdG9yZVJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBzdGFydEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktcGF1c2UnIH0pLCBsYWJlbDogXCJQYXVzZVwiLCBvblRvdWNoVGFwOiB0aGlzLnBhdXNlLmJpbmQodGhpcyksIHNlY29uZGFyeTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RvcmUuaGFzUXVldWUoKSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1wbGF5JyB9KSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjExJ10sIG9uVG91Y2hUYXA6IHRoaXMuc3RhcnQuYmluZCh0aGlzKSwgc2Vjb25kYXJ5OiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3REcm9wVGFyZ2V0KF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGJhY2tncm91bmRDb2xvcjogJyNGQUZBRkEnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAxLCBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZ0xlZnQ6IDYsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1maWxlLXBsdXMnIH0pLCBwcmltYXJ5OiB0cnVlLCBzdHlsZTogeyBtYXJnaW5SaWdodDogNiB9LCBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuNCddLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5GaWxlUGlja2VyLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlckJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRCdXR0b24sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICFsaXN0RW1wdHkgJiYgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuMTInXSwgc3R5bGU6IHsgbWFyZ2luUmlnaHQ6IDAgfSwgcHJpbWFyeTogdHJ1ZSwgb25Ub3VjaFRhcDogdGhpcy5jbGVhci5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIsIGljb25TdHlsZTogeyBjb2xvcjogJyM5ZTllOWUnLCBmb250U2l6ZTogMTggfSwgc3R5bGU6IHsgcGFkZGluZzogMTQgfSwgdG9vbHRpcDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuMjInXSwgb25Ub3VjaFRhcDogdGhpcy50b2dnbGVPcHRpb25zLmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBGaWxlRHJvcFpvbmUsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyYW5zcGFyZW50LWRyb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2Ryb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRm9sZGVyczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRDbGljazogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVOYXRpdmVEcm9wOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ecm9wOiB0aGlzLm9uRHJvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2xkZXJQaWNrZWQ6IHRoaXMub25Gb2xkZXJQaWNrZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogNDIwIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX1RyYW5zZmVyc0xpc3QyLmRlZmF1bHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3M6IHRoaXMucHJvcHMub25EaXNtaXNzXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVXBsb2FkT3B0aW9uc1BhbmUyLmRlZmF1bHQsIHsgY29uZmlnczogY29uZmlncywgb3Blbjogc2hvd09wdGlvbnMsIGFuY2hvckVsOiB0aGlzLnN0YXRlLm9wdGlvbnNBbmNob3JFbCwgb25EaXNtaXNzOiBmdW5jdGlvbiBvbkRpc21pc3MoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnRvZ2dsZU9wdGlvbnMoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgY29uZmlybURpYWxvZyAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfQ29uZmlybUV4aXN0czIuZGVmYXVsdCwgeyBvbkNvbmZpcm06IHRoaXMuZGlhbG9nU3VibWl0LmJpbmQodGhpcyksIG9uQ2FuY2VsOiB0aGlzLmRpYWxvZ0NhbmNlbC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wVXBsb2FkZXI7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEcm9wVXBsb2FkZXIgPSBkcm9wUHJvdmlkZXIoRHJvcFVwbG9hZGVyKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRHJvcFVwbG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciB1cGxvYWRTdGF0dXNNZXNzYWdlcyA9IHtcbiAgICBcIm5ld1wiOiA0MzMsXG4gICAgXCJsb2FkaW5nXCI6IDQzNCxcbiAgICBcImxvYWRlZFwiOiA0MzUsXG4gICAgXCJlcnJvclwiOiA0MzZcbn07XG5cbnZhciBUcmFuc2ZlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFRyYW5zZmVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2Zlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBbGw6IGZhbHNlLFxuICAgICAgICAgICAgc3RhdHVzOiBwcm9wcy5pdGVtLmdldFN0YXR1cygpLFxuICAgICAgICAgICAgcHJldmlld1VybDogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiBwcm9wcy5pdGVtLmdldFByb2dyZXNzKCkgfHwgMFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRyYW5zZmVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgdGhpcy5fcGdPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHN0YXR1czogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLm9ic2VydmUoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuVXBsb2FkSXRlbSAmJiAvXFwuKGpwZT9nfHBuZ3xnaWYpJC9pLnRlc3QoaXRlbS5nZXRGaWxlKCkubmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcmV2aWV3VXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcmV2aWV3VXJsOiBpdGVtLnByZXZpZXdVcmwgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wcmV2aWV3VXJsID0gcmVhZGVyLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHJldmlld1VybDogcmVhZGVyLnJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaXRlbS5nZXRGaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3Byb2dyZXNzJywgdGhpcy5fcGdPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3N0YXR1cycsIHRoaXMuX3N0YXR1c09ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXRQYXJlbnQoKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIGl0ZW0uYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBpdGVtID0gX3Byb3BzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gX3Byb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IF9wcm9wcy5zdHlsZSxcbiAgICAgICAgICAgICAgICBsaW1pdCA9IF9wcm9wcy5saW1pdCxcbiAgICAgICAgICAgICAgICBsZXZlbCA9IF9wcm9wcy5sZXZlbCxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zID0gX3Byb3BzLmV4dGVuc2lvbnM7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcGVuID0gX3N0YXRlLm9wZW4sXG4gICAgICAgICAgICAgICAgc2hvd0FsbCA9IF9zdGF0ZS5zaG93QWxsLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gX3N0YXRlLnByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHN0YXR1cyA9IF9zdGF0ZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgcHJldmlld1VybCA9IF9zdGF0ZS5wcmV2aWV3VXJsO1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBpdGVtLmdldENoaWxkcmVuKCk7XG4gICAgICAgICAgICB2YXIgaXNEaXIgPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5Gb2xkZXJJdGVtO1xuICAgICAgICAgICAgdmFyIGlzUGFydCA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlBhcnRJdGVtO1xuICAgICAgICAgICAgdmFyIGlzU2Vzc2lvbiA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlNlc3Npb247XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgbWFpbjogX2V4dGVuZHMoe30sIHN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNDI0MjQyJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IChsZXZlbCAtIDEpICogMjAsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6IDEyLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAxMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCAjZWVlZWVlXCIsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBjaGlsZHJlbi5sZW5ndGggPyAncG9pbnRlcicgOiAnZGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6IGxldmVsID09PSAxID8gJzNweCBzb2xpZCB0cmFuc3BhcmVudCcgOiAnJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVmdEljb246IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzNixcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6ICcjNjE2MTYxJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3SW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogJ2NvdmVyJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyNCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBpc0RpciA/IDUwMCA6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogaXNQYXJ0ID8gJ2l0YWxpYycgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBnQmFyOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA4MCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNDgsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM5ZTllOWUnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTZcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvZ2dsZUljb246IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYmRiZGJkJyxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogNFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBjaGlsZENvbXBzID0gW10sXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgcGdDb2xvciA9IHZvaWQgMDtcblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVuIHx8IGlzU2Vzc2lvbiAmJiBzdGF0dXMgIT09ICdhbmFseXNlJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2xpY2VkID0gc2hvd0FsbCA/IGNoaWxkcmVuIDogY2hpbGRyZW4uc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzID0gc2xpY2VkLm1hcChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChUcmFuc2Zlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdDogbGltaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBleHRlbnNpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzbGljZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzLnB1c2goX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5saW5lLCB7IGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJMZWZ0OiAnJywgcGFkZGluZ0xlZnQ6IGxldmVsICogMjAgfSksIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzaG93QWxsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiBzdHlsZXMubGVmdEljb24sIGNsYXNzTmFtZTogXCJtZGkgbWRpLXBsdXMtYm94LW91dGxpbmVcIiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGZvbnRTdHlsZTogJ2l0YWxpYycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5sZW5ndGggLSBzbGljZWQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIG1vcmUgLSBzaG93IGFsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b2dnbGVDYWxsYmFjayA9IGZ1bmN0aW9uIHRvZ2dsZUNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBvcGVuOiAhb3BlbiB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMudG9nZ2xlSWNvbiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktY2hldnJvbi1cIiArIChvcGVuID8gXCJkb3duXCIgOiBcInJpZ2h0XCIpIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNEaXIpIHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktZm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnIzRjYWY1MCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1BhcnQpIHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktcGFja2FnZS11cFwiO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnIzRjYWY1MCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgX3N0YXR1cyA9IGl0ZW0uZ2V0U3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gXCJtZGkgbWRpLWZpbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3BhdGgyLmRlZmF1bHQuZ2V0RmlsZUV4dGVuc2lvbihpdGVtLmdldEZ1bGxQYXRoKCkpO1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfZXh0ZW5zaW9ucyRnZXQgPSBleHRlbnNpb25zLmdldChleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udEljb24gPSBfZXh0ZW5zaW9ucyRnZXQuZm9udEljb247XG5cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gJ21pbWVmb250IG1kaSBtZGktJyArIGZvbnRJY29uO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChfc3RhdHVzID09PSAnbG9hZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1zdG9wJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMzLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoX3N0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyNlNTM5MzUnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1yZXN0YXJ0XCIsIHN0eWxlOiB7IGNvbG9yOiAnI2U1MzkzNScgfSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnByb2Nlc3MoZnVuY3Rpb24gKCkge30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3NCYXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaW5lYXJQcm9ncmVzcywgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlZWVlJyB9LCBjb2xvcjogcGdDb2xvciwgbWluOiAwLCBtYXg6IDEwMCwgdmFsdWU6IHByb2dyZXNzLCBtb2RlOiBcImRldGVybWluYXRlXCIgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1Nlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnYW5hbHlzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuYW5hbHl6ZS5zdGVwXCJdO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBzaXplOiAxNiwgdGhpY2tuZXNzOiAyLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDEgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5sZWZ0SWNvbiwgeyBtYXJnaW5Ub3A6IC00LCBtYXJnaW5Cb3R0b206IC01IH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBfZXh0ZW5kcyh7IGJhY2tncm91bmQ6ICd1cmwoJyArIHByZXZpZXdVcmwgKyAnKScgfSwgc3R5bGVzLnByZXZpZXdJbWFnZSkgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGljb25DbGFzcywgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5tYWluLCBjbGFzc05hbWU6IFwidXBsb2FkLVwiICsgc3RhdHVzICsgXCIgXCIgKyAoY2xhc3NOYW1lID8gY2xhc3NOYW1lIDogXCJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5saW5lIH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZnRJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlblxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLnBnQmFyIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhclxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5yaWdodEJ1dHRvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2hpbGRDb21wc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2Zlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1RyYW5zZmVyID0gcmVxdWlyZSgnLi9UcmFuc2ZlcicpO1xuXG52YXIgX1RyYW5zZmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVHJhbnNmZXJzTGlzdCA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyc0xpc3QsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVHJhbnNmZXJzTGlzdChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhbnNmZXJzTGlzdCk7XG5cbiAgICAgICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChUcmFuc2ZlcnNMaXN0Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXJzTGlzdCkpLmNhbGwodGhpcywgcHJvcHMpKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVHJhbnNmZXJzTGlzdCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gW107XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zO1xuXG4gICAgICAgICAgICB2YXIgaXNFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuUmVnaXN0cnkuZ2V0RmlsZXNFeHRlbnNpb25zKCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyA9IGl0ZW1zLnNlc3Npb25zLm1hcChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXIyLmRlZmF1bHQsIHsgaXRlbTogc2Vzc2lvbiwgc3R5bGU6IHt9LCBsaW1pdDogMTAsIGxldmVsOiAwLCBleHRlbnNpb25zOiBleHQgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgaGVpZ2h0OiAnMTAwJScsIHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCB3aWR0aDogJzEwMCUnLCBmb250V2VpZ2h0OiA1MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC4xKScsIGZvbnRTaXplOiAyNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuZHJvcGhlcmVcIl1cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlZWVlZWUnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogY29udGFpbmVyIH0sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50c1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2ZlcnNMaXN0O1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVHJhbnNmZXJzTGlzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVXBsb2FkT3B0aW9uc1BhbmUgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhVcGxvYWRPcHRpb25zUGFuZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVcGxvYWRPcHRpb25zUGFuZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVwbG9hZE9wdGlvbnNQYW5lKTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFVwbG9hZE9wdGlvbnNQYW5lLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXBsb2FkT3B0aW9uc1BhbmUpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXBsb2FkT3B0aW9uc1BhbmUsIFt7XG4gICAgICAgIGtleTogJ3VwZGF0ZUZpZWxkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUZpZWxkKGZOYW1lLCBldmVudCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cblxuICAgICAgICAgICAgaWYgKGZOYW1lID09PSAnYXV0b3N0YXJ0Jykge1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGVTdGFydCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fU1RBUlQnLCAndXBsb2FkX2F1dG9fc2VuZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVN0YXJ0ID0gIXRvZ2dsZVN0YXJ0O1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfYXV0b19zZW5kJywgdG9nZ2xlU3RhcnQsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ2F1dG9jbG9zZScpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19DTE9TRScsICd1cGxvYWRfYXV0b19jbG9zZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIF90b2dnbGVTdGFydCA9ICFfdG9nZ2xlU3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9hdXRvX2Nsb3NlJywgX3RvZ2dsZVN0YXJ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdleGlzdGluZycpIHtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2V4aXN0aW5nJywgZXZlbnQudGFyZ2V0LmdldFNlbGVjdGVkVmFsdWUoKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnc2hvd19wcm9jZXNzZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVNob3dQcm9jZXNzZWQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnVVBMT0FEX1NIT1dfUFJPQ0VTU0VEJywgJ3VwbG9hZF9zaG93X3Byb2Nlc3NlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTaG93UHJvY2Vzc2VkID0gIXRvZ2dsZVNob3dQcm9jZXNzZWQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9zaG93X3Byb2Nlc3NlZCcsIHRvZ2dsZVNob3dQcm9jZXNzZWQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJhbmRvbTogTWF0aC5yYW5kb20oKSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmFkaW9DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmFkaW9DaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5jb25maWdzO1xuXG5cbiAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmFuZG9tOiBNYXRoLnJhbmRvbSgpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5jb25maWdzO1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJyk7XG4gICAgICAgICAgICB2YXIgdG9nZ2xlQ2xvc2UgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX0NMT1NFJywgJ3VwbG9hZF9hdXRvX2Nsb3NlJyk7XG4gICAgICAgICAgICB2YXIgb3ZlcndyaXRlVHlwZSA9IGNvbmZpZ3MuZ2V0T3B0aW9uKCdERUZBVUxUX0VYSVNUSU5HJywgJ3VwbG9hZF9leGlzdGluZycpO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMucHJvcHMuYW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gb25SZXF1ZXN0Q2xvc2UoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLm9uRGlzbWlzcyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzMjAsIHBhZGRpbmdCb3R0b206IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnT3B0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTZweCcsIG1hcmdpblRvcDogLTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZVN0YXJ0LCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b3N0YXJ0JyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzddLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZUNsb3NlLCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b2Nsb3NlJyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzhdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IG92ZXJ3cml0ZVR5cGUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ2FsZXJ0JywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcuYWxlcnQnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZy5mb2xkZXJzJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm1lcmdlJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm92ZXJ3cml0ZSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVwbG9hZE9wdGlvbnNQYW5lO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVXBsb2FkT3B0aW9uc1BhbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBleHBvcnRzLkRyb3BVcGxvYWRlciA9IHVuZGVmaW5lZDtcblxudmFyIF9Ecm9wVXBsb2FkZXIgPSByZXF1aXJlKCcuL0Ryb3BVcGxvYWRlcicpO1xuXG52YXIgX0Ryb3BVcGxvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ecm9wVXBsb2FkZXIpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLkRyb3BVcGxvYWRlciA9IF9Ecm9wVXBsb2FkZXIyLmRlZmF1bHQ7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdDtcbiJdfQ==
