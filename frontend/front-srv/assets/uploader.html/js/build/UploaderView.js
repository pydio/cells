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
                errMessage: {
                    color: '#e53935',
                    fontSize: 11,
                    flex: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
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
                pgColor = void 0,
                errMessage = void 0;

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
                iconClass = "mdi mdi-file";
                var ext = _path2.default.getFileExtension(item.getFullPath());
                if (extensions.has(ext)) {
                    var _extensions$get = extensions.get(ext),
                        fontIcon = _extensions$get.fontIcon;

                    iconClass = 'mimefont mdi mdi-' + fontIcon;
                }

                if (status === 'loading') {
                    rightButton = _react2.default.createElement('span', { className: 'mdi mdi-stop', onClick: function onClick() {
                            return _this3.abort();
                        } });
                } else if (status === 'error') {
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

            if (status === 'error' && item.getErrorMessage()) {
                errMessage = _react2.default.createElement(
                    'span',
                    { style: styles.errMessage, title: item.getErrorMessage() },
                    item.getErrorMessage()
                );
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
                    errMessage,
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC92aWV3L0NvbmZpcm1FeGlzdHMuanMiLCJqcy9idWlsZC92aWV3L0Ryb3BVcGxvYWRlci5qcyIsImpzL2J1aWxkL3ZpZXcvVHJhbnNmZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyc0xpc3QuanMiLCJqcy9idWlsZC92aWV3L1VwbG9hZE9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgQ29uZmlybUV4aXN0cyA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKENvbmZpcm1FeGlzdHMsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gQ29uZmlybUV4aXN0cyhwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29uZmlybUV4aXN0cyk7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENvbmZpcm1FeGlzdHMuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDb25maXJtRXhpc3RzKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmFsdWU6ICdyZW5hbWUtZm9sZGVycycsXG4gICAgICAgICAgICBzYXZlVmFsdWU6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29uZmlybUV4aXN0cywgW3tcbiAgICAgICAga2V5OiAnY2FuY2VsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3N0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgIHNhdmVWYWx1ZSA9IF9zdGF0ZS5zYXZlVmFsdWU7XG5cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Db25maXJtKHZhbHVlLCBzYXZlVmFsdWUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjaGVja0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNhdmVWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JhZGlvQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJhZGlvQ2hhbmdlKGUsIG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IG5ld1ZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IF9zdGF0ZTIudmFsdWUsXG4gICAgICAgICAgICAgICAgc2F2ZVZhbHVlID0gX3N0YXRlMi5zYXZlVmFsdWU7XG5cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIHRvcDogNDksIGxlZnQ6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC43KScgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogNTAwLCBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBtYXJnaW46ICcwIGF1dG8nIH0sIHpEZXB0aDogMiB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoNScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFsxMjRdXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUmFkaW9CdXR0b25Hcm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ2dyb3VwJywgbmFtZTogJ3NoaXBTcGVlZCcsIGRlZmF1bHRTZWxlY3RlZDogdmFsdWUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZS1mb2xkZXJzJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0ucmVuYW1lLmFsbCddLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdyZW5hbWUnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5yZW5hbWUubWVyZ2UnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAnb3ZlcndyaXRlJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLmNvbmZpcm0ub3ZlcndyaXRlJ10gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Ub3A6IDMwLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5zYXZlLmNob2ljZSddLCBjaGVja2VkOiBzYXZlVmFsdWUsIG9uQ2hlY2s6IHRoaXMuY2hlY2tDaGFuZ2UuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs1NF0sIG9uVG91Y2hUYXA6IHRoaXMuY2FuY2VsLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWlzZWRCdXR0b24sIHsgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzQ4XSwgb25Ub3VjaFRhcDogdGhpcy5zdWJtaXQuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDb25maXJtRXhpc3RzO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ29uZmlybUV4aXN0cztcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9VcGxvYWRPcHRpb25zUGFuZSA9IHJlcXVpcmUoJy4vVXBsb2FkT3B0aW9uc1BhbmUnKTtcblxudmFyIF9VcGxvYWRPcHRpb25zUGFuZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9VcGxvYWRPcHRpb25zUGFuZSk7XG5cbnZhciBfVHJhbnNmZXJzTGlzdCA9IHJlcXVpcmUoJy4vVHJhbnNmZXJzTGlzdCcpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNmZXJzTGlzdCk7XG5cbnZhciBfQ29uZmlybUV4aXN0cyA9IHJlcXVpcmUoJy4vQ29uZmlybUV4aXN0cycpO1xuXG52YXIgX0NvbmZpcm1FeGlzdHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ29uZmlybUV4aXN0cyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoJ2hvYycpLFxuICAgIGRyb3BQcm92aWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLmRyb3BQcm92aWRlcjtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliMiA9IF9weWRpbzIuZGVmYXVsdC5yZXF1aXJlTGliKCdmb3JtJyksXG4gICAgRmlsZURyb3Bab25lID0gX1B5ZGlvJHJlcXVpcmVMaWIyLkZpbGVEcm9wWm9uZTtcblxudmFyIERyb3BVcGxvYWRlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKERyb3BVcGxvYWRlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEcm9wVXBsb2FkZXIocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERyb3BVcGxvYWRlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERyb3BVcGxvYWRlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERyb3BVcGxvYWRlcikpLmNhbGwodGhpcywgcHJvcHMpKTtcblxuICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgIF90aGlzLl9zdG9yZU9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBzdG9yZS5nZXRJdGVtcygpLFxuICAgICAgICAgICAgICAgIHN0b3JlUnVubmluZzogc3RvcmUuaXNSdW5uaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBzdG9yZS5vYnNlcnZlKFwidXBkYXRlXCIsIF90aGlzLl9zdG9yZU9ic2VydmVyKTtcbiAgICAgICAgc3RvcmUub2JzZXJ2ZShcImF1dG9fY2xvc2VcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzLnByb3BzLm9uRGlzbWlzcykge1xuICAgICAgICAgICAgICAgIF90aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBfdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3dPcHRpb25zOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbmZpZ3M6IFVwbG9hZGVyTW9kZWwuQ29uZmlncy5nZXRJbnN0YW5jZSgpLFxuICAgICAgICAgICAgaXRlbXM6IHN0b3JlLmdldEl0ZW1zKCksXG4gICAgICAgICAgICBzdG9yZVJ1bm5pbmc6IHN0b3JlLmlzUnVubmluZygpLFxuICAgICAgICAgICAgY29uZmlybURpYWxvZzogcHJvcHMuY29uZmlybURpYWxvZ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERyb3BVcGxvYWRlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAgICAgaWYgKG5leHRQcm9wcy5jb25maXJtRGlhbG9nICE9PSB0aGlzLnN0YXRlLmNvbmZpcm1EaWFsb2cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogbmV4dFByb3BzLmNvbmZpcm1EaWFsb2cgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NvbXBvbmVudFdpbGxVbm1vdW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0b3JlT2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuc3RvcE9ic2VydmluZyhcInVwZGF0ZVwiLCB0aGlzLl9zdG9yZU9ic2VydmVyKTtcbiAgICAgICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuc3RvcE9ic2VydmluZyhcImF1dG9fY2xvc2VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29uRHJvcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkRyb3AoZmlsZXMpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0Tm9kZSA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRleHRIb2xkZXIoKS5nZXRDb250ZXh0Tm9kZSgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmhhbmRsZURyb3BFdmVudFJlc3VsdHMobnVsbCwgZmlsZXMsIGNvbnRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Gb2xkZXJQaWNrZWQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb25Gb2xkZXJQaWNrZWQoZmlsZXMpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0Tm9kZSA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLmdldENvbnRleHRIb2xkZXIoKS5nZXRDb250ZXh0Tm9kZSgpO1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmhhbmRsZUZvbGRlclBpY2tlclJlc3VsdChmaWxlcywgY29udGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdGFydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkucmVzdW1lKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3BhdXNlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKGUpIHtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuY2xlYXJBbGwoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndG9nZ2xlT3B0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGVPcHRpb25zKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIF9zdGF0ZSRzaG93T3B0aW9ucyA9IF9zdGF0ZS5zaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzaG93T3B0aW9ucyA9IF9zdGF0ZSRzaG93T3B0aW9ucyA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfc3RhdGUkc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldCA9IF9zdGF0ZS5jdXJyZW50VGFyZ2V0O1xuXG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zOiAhc2hvd09wdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uc0FuY2hvckVsOiBlLmN1cnJlbnRUYXJnZXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuRmlsZVBpY2tlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRmlsZVBpY2tlcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuZHJvcHpvbmUub3BlbigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuRm9sZGVyUGlja2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5Gb2xkZXJQaWNrZXIoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5yZWZzLmRyb3B6b25lLm9wZW5Gb2xkZXJQaWNrZXIoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZGlhbG9nU3VibWl0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRpYWxvZ1N1Ym1pdChuZXdWYWx1ZSwgc2F2ZVZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMuc3RhdGUuY29uZmlncztcblxuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLmdldEl0ZW1zKCkuc2Vzc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldFN0YXR1cygpID09PSAnY29uZmlybScpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi5wcmVwYXJlKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChzYXZlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2V4aXN0aW5nJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IGZhbHNlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ3VwbG9hZCcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaWFsb2dDYW5jZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlhbG9nQ2FuY2VsKCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgc3RvcmUuZ2V0SXRlbXMoKS5zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb24uZ2V0U3RhdHVzKCkgPT09ICdjb25maXJtJykge1xuICAgICAgICAgICAgICAgICAgICBzdG9yZS5yZW1vdmVTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbmZpcm1EaWFsb2c6IGZhbHNlIH0pO1xuICAgICAgICAgICAgX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ3VwbG9hZCcpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoO1xuICAgICAgICAgICAgdmFyIGNvbm5lY3REcm9wVGFyZ2V0ID0gdGhpcy5wcm9wcy5jb25uZWN0RHJvcFRhcmdldCB8fCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICBjb25maWdzID0gX3N0YXRlMi5jb25maWdzLFxuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zID0gX3N0YXRlMi5zaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtcyA9IF9zdGF0ZTIuaXRlbXMsXG4gICAgICAgICAgICAgICAgc3RvcmVSdW5uaW5nID0gX3N0YXRlMi5zdG9yZVJ1bm5pbmcsXG4gICAgICAgICAgICAgICAgY29uZmlybURpYWxvZyA9IF9zdGF0ZTIuY29uZmlybURpYWxvZztcblxuICAgICAgICAgICAgdmFyIHN0b3JlID0gVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgdmFyIGxpc3RFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBpdGVtcy5zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMuZ2V0Q2hpbGRyZW4oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdEVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZm9sZGVyQnV0dG9uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHN0YXJ0QnV0dG9uID0gdm9pZCAwO1xuICAgICAgICAgICAgdmFyIGUgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGUuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ZpbGUnKTtcbiAgICAgICAgICAgIGlmICgnd2Via2l0ZGlyZWN0b3J5JyBpbiBlKSB7XG4gICAgICAgICAgICAgICAgZm9sZGVyQnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1mb2xkZXItcGx1cycgfSksIHByaW1hcnk6IHRydWUsIHN0eWxlOiB7IG1hcmdpblJpZ2h0OiAxMCB9LCBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuNSddLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5Gb2xkZXJQaWNrZXIuYmluZCh0aGlzKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoc3RvcmVSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLXBhdXNlJyB9KSwgbGFiZWw6IFwiUGF1c2VcIiwgb25Ub3VjaFRhcDogdGhpcy5wYXVzZS5iaW5kKHRoaXMpLCBzZWNvbmRhcnk6IHRydWUgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0b3JlLmhhc1F1ZXVlKCkpIHtcbiAgICAgICAgICAgICAgICBzdGFydEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktcGxheScgfSksIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci4xMSddLCBvblRvdWNoVGFwOiB0aGlzLnN0YXJ0LmJpbmQodGhpcyksIHNlY29uZGFyeTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25uZWN0RHJvcFRhcmdldChfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjRkFGQUZBJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHpEZXB0aDogMSwgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIHBhZGRpbmdMZWZ0OiA2LCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktZmlsZS1wbHVzJyB9KSwgcHJpbWFyeTogdHJ1ZSwgc3R5bGU6IHsgbWFyZ2luUmlnaHQ6IDYgfSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjQnXSwgb25Ub3VjaFRhcDogdGhpcy5vcGVuRmlsZVBpY2tlci5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJCdXR0b24sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QnV0dG9uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHsgZmxleDogMSB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAhbGlzdEVtcHR5ICYmIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjEyJ10sIHN0eWxlOiB7IG1hcmdpblJpZ2h0OiAwIH0sIHByaW1hcnk6IHRydWUsIG9uVG91Y2hUYXA6IHRoaXMuY2xlYXIuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktZG90cy12ZXJ0aWNhbFwiLCBpY29uU3R5bGU6IHsgY29sb3I6ICcjOWU5ZTllJywgZm9udFNpemU6IDE4IH0sIHN0eWxlOiB7IHBhZGRpbmc6IDE0IH0sIHRvb2x0aXA6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjIyJ10sIG9uVG91Y2hUYXA6IHRoaXMudG9nZ2xlT3B0aW9ucy5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgRmlsZURyb3Bab25lLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICd0cmFuc3BhcmVudC1kcm9wem9uZScsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdkcm9wem9uZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUZvbGRlcnM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0Q2xpY2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWdub3JlTmF0aXZlRHJvcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRHJvcDogdGhpcy5vbkRyb3AuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9sZGVyUGlja2VkOiB0aGlzLm9uRm9sZGVyUGlja2VkLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6IDQyMCB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9UcmFuc2ZlcnNMaXN0Mi5kZWZhdWx0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogaXRlbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvU3RhcnQ6IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fU1RBUlQnLCAndXBsb2FkX2F1dG9fc2VuZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25EaXNtaXNzOiB0aGlzLnByb3BzLm9uRGlzbWlzc1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX1VwbG9hZE9wdGlvbnNQYW5lMi5kZWZhdWx0LCB7IGNvbmZpZ3M6IGNvbmZpZ3MsIG9wZW46IHNob3dPcHRpb25zLCBhbmNob3JFbDogdGhpcy5zdGF0ZS5vcHRpb25zQW5jaG9yRWwsIG9uRGlzbWlzczogZnVuY3Rpb24gb25EaXNtaXNzKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi50b2dnbGVPcHRpb25zKGUpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pLFxuICAgICAgICAgICAgICAgIGNvbmZpcm1EaWFsb2cgJiYgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX0NvbmZpcm1FeGlzdHMyLmRlZmF1bHQsIHsgb25Db25maXJtOiB0aGlzLmRpYWxvZ1N1Ym1pdC5iaW5kKHRoaXMpLCBvbkNhbmNlbDogdGhpcy5kaWFsb2dDYW5jZWwuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRHJvcFVwbG9hZGVyO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRHJvcFVwbG9hZGVyID0gZHJvcFByb3ZpZGVyKERyb3BVcGxvYWRlcik7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IERyb3BVcGxvYWRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXRoKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgdXBsb2FkU3RhdHVzTWVzc2FnZXMgPSB7XG4gICAgXCJuZXdcIjogNDMzLFxuICAgIFwibG9hZGluZ1wiOiA0MzQsXG4gICAgXCJsb2FkZWRcIjogNDM1LFxuICAgIFwiZXJyb3JcIjogNDM2XG59O1xuXG52YXIgVHJhbnNmZXIgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhUcmFuc2ZlciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2Zlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhbnNmZXIpO1xuXG4gICAgICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChUcmFuc2Zlci5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFRyYW5zZmVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICBzaG93QWxsOiBmYWxzZSxcbiAgICAgICAgICAgIHN0YXR1czogcHJvcHMuaXRlbS5nZXRTdGF0dXMoKSxcbiAgICAgICAgICAgIHByZXZpZXdVcmw6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogcHJvcHMuaXRlbS5nZXRQcm9ncmVzcygpIHx8IDBcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlciwgW3tcbiAgICAgICAga2V5OiAnY29tcG9uZW50RGlkTW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIHRoaXMuX3BnT2JzZXJ2ZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBwcm9ncmVzczogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fc3RhdHVzT2JzZXJ2ZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyBzdGF0dXM6IHZhbHVlIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGl0ZW0ub2JzZXJ2ZSgncHJvZ3Jlc3MnLCB0aGlzLl9wZ09ic2VydmVyKTtcbiAgICAgICAgICAgIGl0ZW0ub2JzZXJ2ZSgnc3RhdHVzJywgdGhpcy5fc3RhdHVzT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdjaGlsZHJlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlVwbG9hZEl0ZW0gJiYgL1xcLihqcGU/Z3xwbmd8Z2lmKSQvaS50ZXN0KGl0ZW0uZ2V0RmlsZSgpLm5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ucHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcHJldmlld1VybDogaXRlbS5wcmV2aWV3VXJsIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucHJldmlld1VybCA9IHJlYWRlci5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByZXZpZXdVcmw6IHJlYWRlci5yZXN1bHQgfSk7XG4gICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGl0ZW0uZ2V0RmlsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgaXRlbS5zdG9wT2JzZXJ2aW5nKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5zdG9wT2JzZXJ2aW5nKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0UGFyZW50KCkpIHtcbiAgICAgICAgICAgICAgICBpdGVtLmdldFBhcmVudCgpLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhYm9ydCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhYm9ydCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLmFib3J0KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IF9wcm9wcy5pdGVtLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IF9wcm9wcy5jbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgc3R5bGUgPSBfcHJvcHMuc3R5bGUsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBfcHJvcHMubGltaXQsXG4gICAgICAgICAgICAgICAgbGV2ZWwgPSBfcHJvcHMubGV2ZWwsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucyA9IF9wcm9wcy5leHRlbnNpb25zO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgb3BlbiA9IF9zdGF0ZS5vcGVuLFxuICAgICAgICAgICAgICAgIHNob3dBbGwgPSBfc3RhdGUuc2hvd0FsbCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IF9zdGF0ZS5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBfc3RhdGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIHByZXZpZXdVcmwgPSBfc3RhdGUucHJldmlld1VybDtcblxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gaXRlbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgdmFyIGlzRGlyID0gaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuRm9sZGVySXRlbTtcbiAgICAgICAgICAgIHZhciBpc1BhcnQgPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5QYXJ0SXRlbTtcbiAgICAgICAgICAgIHZhciBpc1Nlc3Npb24gPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5TZXNzaW9uO1xuXG4gICAgICAgICAgICB2YXIgc3R5bGVzID0ge1xuICAgICAgICAgICAgICAgIG1haW46IF9leHRlbmRzKHt9LCBzdHlsZSwge1xuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTQsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzQyNDI0MidcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAobGV2ZWwgLSAxKSAqIDIwLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAxMixcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogMTIsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogXCIxcHggc29saWQgI2VlZWVlZVwiLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogY2hpbGRyZW4ubGVuZ3RoID8gJ3BvaW50ZXInIDogJ2RlZmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiBsZXZlbCA9PT0gMSA/ICczcHggc29saWQgdHJhbnNwYXJlbnQnIDogJydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxlZnRJY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogMzYsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpc1BhcnQgPyAnIzllOWU5ZScgOiAnIzYxNjE2MScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJldmlld0ltYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlJyxcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb3ZlcicsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogMjQsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNTAlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogaXNEaXIgPyA1MDAgOiA0MDAsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpc1BhcnQgPyAnIzllOWU5ZScgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBmb250U3R5bGU6IGlzUGFydCA/ICdpdGFsaWMnIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2U1MzkzNScsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxMSxcbiAgICAgICAgICAgICAgICAgICAgZmxleDogMixcbiAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXG4gICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwZ0Jhcjoge1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogODAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbjoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDQ4LFxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjOWU5ZTllJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0b2dnbGVJY29uOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCcsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbkxlZnQ6IDRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRDb21wcyA9IFtdLFxuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHBnQ29sb3IgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgZXJyTWVzc2FnZSA9IHZvaWQgMDtcblxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVuIHx8IGlzU2Vzc2lvbiAmJiBzdGF0dXMgIT09ICdhbmFseXNlJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2xpY2VkID0gc2hvd0FsbCA/IGNoaWxkcmVuIDogY2hpbGRyZW4uc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzID0gc2xpY2VkLm1hcChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChUcmFuc2Zlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogY2hpbGQuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBjaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW1pdDogbGltaXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBleHRlbnNpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzbGljZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzLnB1c2goX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5saW5lLCB7IGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJMZWZ0OiAnJywgcGFkZGluZ0xlZnQ6IGxldmVsICogMjAgfSksIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBzaG93QWxsOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiBzdHlsZXMubGVmdEljb24sIGNsYXNzTmFtZTogXCJtZGkgbWRpLXBsdXMtYm94LW91dGxpbmVcIiB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGZsZXg6IDEsIGZvbnRTdHlsZTogJ2l0YWxpYycgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5sZW5ndGggLSBzbGljZWQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIG1vcmUgLSBzaG93IGFsbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b2dnbGVDYWxsYmFjayA9IGZ1bmN0aW9uIHRvZ2dsZUNhbGxiYWNrKCkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczMuc2V0U3RhdGUoeyBvcGVuOiAhb3BlbiB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMudG9nZ2xlSWNvbiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktY2hldnJvbi1cIiArIChvcGVuID8gXCJkb3duXCIgOiBcInJpZ2h0XCIpIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNEaXIpIHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktZm9sZGVyXCI7XG4gICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1kZWxldGUnLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnIzRjYWY1MCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1BhcnQpIHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktcGFja2FnZS11cFwiO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMTAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnIzRjYWY1MCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktZmlsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcGF0aDIuZGVmYXVsdC5nZXRGaWxlRXh0ZW5zaW9uKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuaGFzKGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9leHRlbnNpb25zJGdldCA9IGV4dGVuc2lvbnMuZ2V0KGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250SWNvbiA9IF9leHRlbnNpb25zJGdldC5mb250SWNvbjtcblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSAnbWltZWZvbnQgbWRpIG1kaS0nICsgZm9udEljb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktc3RvcCcsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMy5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyNlNTM5MzUnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IFwibWRpIG1kaS1yZXN0YXJ0XCIsIHN0eWxlOiB7IGNvbG9yOiAnI2U1MzkzNScgfSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnByb2Nlc3MoZnVuY3Rpb24gKCkge30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwZ0NvbG9yID0gJyM0Y2FmNTAnO1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBsYWJlbCA9IF9wYXRoMi5kZWZhdWx0LmdldEJhc2VuYW1lKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3NCYXIgPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5MaW5lYXJQcm9ncmVzcywgeyBzdHlsZTogeyBiYWNrZ3JvdW5kQ29sb3I6ICcjZWVlZWVlJyB9LCBjb2xvcjogcGdDb2xvciwgbWluOiAwLCBtYXg6IDEwMCwgdmFsdWU6IHByb2dyZXNzLCBtb2RlOiBcImRldGVybWluYXRlXCIgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1Nlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnYW5hbHlzZScpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWwgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuYW5hbHl6ZS5zdGVwXCJdO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2lyY3VsYXJQcm9ncmVzcywgeyBzaXplOiAxNiwgdGhpY2tuZXNzOiAyLCBzdHlsZTogeyBtYXJnaW5Ub3A6IDEgfSB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJldmlld1VybCkge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoe30sIHN0eWxlcy5sZWZ0SWNvbiwgeyBtYXJnaW5Ub3A6IC00LCBtYXJnaW5Cb3R0b206IC01IH0pIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBfZXh0ZW5kcyh7IGJhY2tncm91bmQ6ICd1cmwoJyArIHByZXZpZXdVcmwgKyAnKScgfSwgc3R5bGVzLnByZXZpZXdJbWFnZSkgfSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZWZ0SWNvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6IGljb25DbGFzcywgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2Vycm9yJyAmJiBpdGVtLmdldEVycm9yTWVzc2FnZSgpKSB7XG4gICAgICAgICAgICAgICAgZXJyTWVzc2FnZSA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5lcnJNZXNzYWdlLCB0aXRsZTogaXRlbS5nZXRFcnJvck1lc3NhZ2UoKSB9LFxuICAgICAgICAgICAgICAgICAgICBpdGVtLmdldEVycm9yTWVzc2FnZSgpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5tYWluLCBjbGFzc05hbWU6IFwidXBsb2FkLVwiICsgc3RhdHVzICsgXCIgXCIgKyAoY2xhc3NOYW1lID8gY2xhc3NOYW1lIDogXCJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5saW5lIH0sXG4gICAgICAgICAgICAgICAgICAgIGxlZnRJY29uLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgb25DbGljazogdG9nZ2xlQ2FsbGJhY2ssIHN0eWxlOiBzdHlsZXMubGFiZWwgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlT3BlblxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBlcnJNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLnBnQmFyIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0JhclxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5yaWdodEJ1dHRvbiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2hpbGRDb21wc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2Zlcjtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zZmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1RyYW5zZmVyID0gcmVxdWlyZSgnLi9UcmFuc2ZlcicpO1xuXG52YXIgX1RyYW5zZmVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVHJhbnNmZXJzTGlzdCA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyc0xpc3QsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gVHJhbnNmZXJzTGlzdChwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVHJhbnNmZXJzTGlzdCk7XG5cbiAgICAgICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChUcmFuc2ZlcnNMaXN0Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXJzTGlzdCkpLmNhbGwodGhpcywgcHJvcHMpKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVHJhbnNmZXJzTGlzdCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnRzID0gW107XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnByb3BzLml0ZW1zO1xuXG4gICAgICAgICAgICB2YXIgaXNFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuUmVnaXN0cnkuZ2V0RmlsZXNFeHRlbnNpb25zKCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyA9IGl0ZW1zLnNlc3Npb25zLm1hcChmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVHJhbnNmZXIyLmRlZmF1bHQsIHsgaXRlbTogc2Vzc2lvbiwgc3R5bGU6IHt9LCBsaW1pdDogMTAsIGxldmVsOiAwLCBleHRlbnNpb25zOiBleHQgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgaGVpZ2h0OiAnMTAwJScsIHdpZHRoOiAnMTAwJScgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdjZW50ZXInLCB3aWR0aDogJzEwMCUnLCBmb250V2VpZ2h0OiA1MDAsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC4xKScsIGZvbnRTaXplOiAyNCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0TWVzc2FnZXMoKVtcImh0bWxfdXBsb2FkZXIuZHJvcGhlcmVcIl1cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSB7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3dZOiAnYXV0bycsXG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlZWVlZWUnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogY29udGFpbmVyIH0sXG4gICAgICAgICAgICAgICAgY29tcG9uZW50c1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBUcmFuc2ZlcnNMaXN0O1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVHJhbnNmZXJzTGlzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgVXBsb2FkT3B0aW9uc1BhbmUgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhVcGxvYWRPcHRpb25zUGFuZSwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBVcGxvYWRPcHRpb25zUGFuZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVwbG9hZE9wdGlvbnNQYW5lKTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFVwbG9hZE9wdGlvbnNQYW5lLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXBsb2FkT3B0aW9uc1BhbmUpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXBsb2FkT3B0aW9uc1BhbmUsIFt7XG4gICAgICAgIGtleTogJ3VwZGF0ZUZpZWxkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUZpZWxkKGZOYW1lLCBldmVudCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cblxuICAgICAgICAgICAgaWYgKGZOYW1lID09PSAnYXV0b3N0YXJ0Jykge1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGVTdGFydCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fU1RBUlQnLCAndXBsb2FkX2F1dG9fc2VuZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVN0YXJ0ID0gIXRvZ2dsZVN0YXJ0O1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfYXV0b19zZW5kJywgdG9nZ2xlU3RhcnQsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ2F1dG9jbG9zZScpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19DTE9TRScsICd1cGxvYWRfYXV0b19jbG9zZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIF90b2dnbGVTdGFydCA9ICFfdG9nZ2xlU3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9hdXRvX2Nsb3NlJywgX3RvZ2dsZVN0YXJ0LCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdleGlzdGluZycpIHtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2V4aXN0aW5nJywgZXZlbnQudGFyZ2V0LmdldFNlbGVjdGVkVmFsdWUoKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnc2hvd19wcm9jZXNzZWQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVNob3dQcm9jZXNzZWQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnVVBMT0FEX1NIT1dfUFJPQ0VTU0VEJywgJ3VwbG9hZF9zaG93X3Byb2Nlc3NlZCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTaG93UHJvY2Vzc2VkID0gIXRvZ2dsZVNob3dQcm9jZXNzZWQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9zaG93X3Byb2Nlc3NlZCcsIHRvZ2dsZVNob3dQcm9jZXNzZWQsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJhbmRvbTogTWF0aC5yYW5kb20oKSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmFkaW9DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmFkaW9DaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5jb25maWdzO1xuXG5cbiAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmFuZG9tOiBNYXRoLnJhbmRvbSgpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5wcm9wcy5jb25maWdzO1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJyk7XG4gICAgICAgICAgICB2YXIgdG9nZ2xlQ2xvc2UgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX0NMT1NFJywgJ3VwbG9hZF9hdXRvX2Nsb3NlJyk7XG4gICAgICAgICAgICB2YXIgb3ZlcndyaXRlVHlwZSA9IGNvbmZpZ3MuZ2V0T3B0aW9uKCdERUZBVUxUX0VYSVNUSU5HJywgJ3VwbG9hZF9leGlzdGluZycpO1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUG9wb3ZlcixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlbixcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yRWw6IHRoaXMucHJvcHMuYW5jaG9yRWwsXG4gICAgICAgICAgICAgICAgICAgIGFuY2hvck9yaWdpbjogeyBob3Jpem9udGFsOiAncmlnaHQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSxcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAndG9wJyB9LFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3RDbG9zZTogZnVuY3Rpb24gb25SZXF1ZXN0Q2xvc2UoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLm9uRGlzbWlzcyhlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAzMjAsIHBhZGRpbmdCb3R0b206IDYgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlN1YmhlYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnT3B0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMTZweCcsIG1hcmdpblRvcDogLTYgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZVN0YXJ0LCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b3N0YXJ0JyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzddLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgc3R5bGU6IHsgbWFyZ2luOiAnOHB4IDAnIH0sIGNoZWNrZWQ6IHRvZ2dsZUNsb3NlLCBsYWJlbFBvc2l0aW9uOiBcInJpZ2h0XCIsIG9uQ2hlY2s6IHRoaXMudXBkYXRlRmllbGQuYmluZCh0aGlzLCAnYXV0b2Nsb3NlJyksIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFszMzhdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxNCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcnXVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAxNiwgZm9udFNpemU6IDE0LCBwYWRkaW5nVG9wOiAwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdncm91cCcsIG5hbWU6ICdzaGlwU3BlZWQnLCBkZWZhdWx0U2VsZWN0ZWQ6IG92ZXJ3cml0ZVR5cGUsIG9uQ2hhbmdlOiB0aGlzLnJhZGlvQ2hhbmdlLmJpbmQodGhpcykgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ2FsZXJ0JywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcuYWxlcnQnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZy5mb2xkZXJzJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm1lcmdlJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ292ZXJ3cml0ZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLm92ZXJ3cml0ZSddIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVwbG9hZE9wdGlvbnNQYW5lO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVXBsb2FkT3B0aW9uc1BhbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBleHBvcnRzLkRyb3BVcGxvYWRlciA9IHVuZGVmaW5lZDtcblxudmFyIF9Ecm9wVXBsb2FkZXIgPSByZXF1aXJlKCcuL0Ryb3BVcGxvYWRlcicpO1xuXG52YXIgX0Ryb3BVcGxvYWRlcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Ecm9wVXBsb2FkZXIpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QgPSByZXF1aXJlKCcuL1RyYW5zZmVyc0xpc3QnKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1RyYW5zZmVyc0xpc3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLkRyb3BVcGxvYWRlciA9IF9Ecm9wVXBsb2FkZXIyLmRlZmF1bHQ7XG5leHBvcnRzLlRyYW5zZmVyc0xpc3QgPSBfVHJhbnNmZXJzTGlzdDIuZGVmYXVsdDtcbiJdfQ==
