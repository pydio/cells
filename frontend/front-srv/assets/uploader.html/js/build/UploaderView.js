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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC92aWV3L0NvbmZpcm1FeGlzdHMuanMiLCJqcy9idWlsZC92aWV3L0Ryb3BVcGxvYWRlci5qcyIsImpzL2J1aWxkL3ZpZXcvVHJhbnNmZXIuanMiLCJqcy9idWlsZC92aWV3L1RyYW5zZmVyc0xpc3QuanMiLCJqcy9idWlsZC92aWV3L1VwbG9hZE9wdGlvbnNQYW5lLmpzIiwianMvYnVpbGQvdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBDb25maXJtRXhpc3RzID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoQ29uZmlybUV4aXN0cywgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBDb25maXJtRXhpc3RzKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb25maXJtRXhpc3RzKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQ29uZmlybUV4aXN0cy5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKENvbmZpcm1FeGlzdHMpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2YWx1ZTogJ3JlbmFtZS1mb2xkZXJzJyxcbiAgICAgICAgICAgIHNhdmVWYWx1ZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDb25maXJtRXhpc3RzLCBbe1xuICAgICAgICBrZXk6ICdjYW5jZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBfc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgc2F2ZVZhbHVlID0gX3N0YXRlLnNhdmVWYWx1ZTtcblxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0odmFsdWUsIHNhdmVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrQ2hhbmdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNoZWNrQ2hhbmdlKGUsIG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2F2ZVZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmFkaW9DaGFuZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmFkaW9DaGFuZ2UoZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gX3N0YXRlMi52YWx1ZSxcbiAgICAgICAgICAgICAgICBzYXZlVmFsdWUgPSBfc3RhdGUyLnNhdmVWYWx1ZTtcblxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwb3NpdGlvbjogJ2Fic29sdXRlJywgcGFkZGluZzogMTYsIGZvbnRTaXplOiAxNCwgdG9wOiA0OSwgbGVmdDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjcpJyB9IH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiA1MDAsIHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIG1hcmdpbjogJzAgYXV0bycgfSwgekRlcHRoOiAyIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2g1JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWzEyNF1cbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbkdyb3VwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcmVmOiAnZ3JvdXAnLCBuYW1lOiAnc2hpcFNwZWVkJywgZGVmYXVsdFNlbGVjdGVkOiB2YWx1ZSwgb25DaGFuZ2U6IHRoaXMucmFkaW9DaGFuZ2UuYmluZCh0aGlzKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lLWZvbGRlcnMnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5yZW5hbWUuYWxsJ10sIHN0eWxlOiB7IHBhZGRpbmdCb3R0b206IDggfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5SYWRpb0J1dHRvbiwgeyB2YWx1ZTogJ3JlbmFtZScsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLnJlbmFtZS5tZXJnZSddLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdvdmVyd3JpdGUnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIuY29uZmlybS5vdmVyd3JpdGUnXSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIG1hcmdpblRvcDogMzAsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5jb25maXJtLnNhdmUuY2hvaWNlJ10sIGNoZWNrZWQ6IHNhdmVWYWx1ZSwgb25DaGVjazogdGhpcy5jaGVja0NoYW5nZS5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IHN0eWxlOiB7IGZsZXg6IDEgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzU0XSwgb25Ub3VjaFRhcDogdGhpcy5jYW5jZWwuYmluZCh0aGlzKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhaXNlZEJ1dHRvbiwgeyBwcmltYXJ5OiB0cnVlLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbNDhdLCBvblRvdWNoVGFwOiB0aGlzLnN1Ym1pdC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbmZpcm1FeGlzdHM7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBDb25maXJtRXhpc3RzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX1VwbG9hZE9wdGlvbnNQYW5lID0gcmVxdWlyZSgnLi9VcGxvYWRPcHRpb25zUGFuZScpO1xuXG52YXIgX1VwbG9hZE9wdGlvbnNQYW5lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX1VwbG9hZE9wdGlvbnNQYW5lKTtcblxudmFyIF9UcmFuc2ZlcnNMaXN0ID0gcmVxdWlyZSgnLi9UcmFuc2ZlcnNMaXN0Jyk7XG5cbnZhciBfVHJhbnNmZXJzTGlzdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9UcmFuc2ZlcnNMaXN0KTtcblxudmFyIF9Db25maXJtRXhpc3RzID0gcmVxdWlyZSgnLi9Db25maXJtRXhpc3RzJyk7XG5cbnZhciBfQ29uZmlybUV4aXN0czIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9Db25maXJtRXhpc3RzKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yLmRlZmF1bHQucmVxdWlyZUxpYignaG9jJyksXG4gICAgZHJvcFByb3ZpZGVyID0gX1B5ZGlvJHJlcXVpcmVMaWIuZHJvcFByb3ZpZGVyO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIyID0gX3B5ZGlvMi5kZWZhdWx0LnJlcXVpcmVMaWIoJ2Zvcm0nKSxcbiAgICBGaWxlRHJvcFpvbmUgPSBfUHlkaW8kcmVxdWlyZUxpYjIuRmlsZURyb3Bab25lO1xuXG52YXIgRHJvcFVwbG9hZGVyID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRHJvcFVwbG9hZGVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERyb3BVcGxvYWRlcihwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcFVwbG9hZGVyKTtcblxuICAgICAgICB2YXIgX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoRHJvcFVwbG9hZGVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRHJvcFVwbG9hZGVyKSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuXG4gICAgICAgIHZhciBzdG9yZSA9IFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgX3RoaXMuX3N0b3JlT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXRlbXM6IHN0b3JlLmdldEl0ZW1zKCksXG4gICAgICAgICAgICAgICAgc3RvcmVSdW5uaW5nOiBzdG9yZS5pc1J1bm5pbmcoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHN0b3JlLm9ic2VydmUoXCJ1cGRhdGVcIiwgX3RoaXMuX3N0b3JlT2JzZXJ2ZXIpO1xuICAgICAgICBzdG9yZS5vYnNlcnZlKFwiYXV0b19jbG9zZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMucHJvcHMub25EaXNtaXNzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF90aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvd09wdGlvbnM6IGZhbHNlLFxuICAgICAgICAgICAgY29uZmlnczogVXBsb2FkZXJNb2RlbC5Db25maWdzLmdldEluc3RhbmNlKCksXG4gICAgICAgICAgICBpdGVtczogc3RvcmUuZ2V0SXRlbXMoKSxcbiAgICAgICAgICAgIHN0b3JlUnVubmluZzogc3RvcmUuaXNSdW5uaW5nKCksXG4gICAgICAgICAgICBjb25maXJtRGlhbG9nOiBwcm9wcy5jb25maXJtRGlhbG9nXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRHJvcFVwbG9hZGVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgICAgICBpZiAobmV4dFByb3BzLmNvbmZpcm1EaWFsb2cgIT09IHRoaXMuc3RhdGUuY29uZmlybURpYWxvZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb25maXJtRGlhbG9nOiBuZXh0UHJvcHMuY29uZmlybURpYWxvZyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnY29tcG9uZW50V2lsbFVubW91bnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RvcmVPYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5zdG9wT2JzZXJ2aW5nKFwidXBkYXRlXCIsIHRoaXMuX3N0b3JlT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5zdG9wT2JzZXJ2aW5nKFwiYXV0b19jbG9zZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnb25Ecm9wJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uRHJvcChmaWxlcykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuaGFuZGxlRHJvcEV2ZW50UmVzdWx0cyhudWxsLCBmaWxlcywgY29udGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvbkZvbGRlclBpY2tlZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkZvbGRlclBpY2tlZChmaWxlcykge1xuICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuZ2V0Q29udGV4dEhvbGRlcigpLmdldENvbnRleHROb2RlKCk7XG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuaGFuZGxlRm9sZGVyUGlja2VyUmVzdWx0KGZpbGVzLCBjb250ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0YXJ0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5yZXN1bWUoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncGF1c2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoZSkge1xuICAgICAgICAgICAgVXBsb2FkZXJNb2RlbC5TdG9yZS5nZXRJbnN0YW5jZSgpLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NsZWFyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNsZWFyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFVwbG9hZGVyTW9kZWwuU3RvcmUuZ2V0SW5zdGFuY2UoKS5jbGVhckFsbCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0b2dnbGVPcHRpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZU9wdGlvbnMoZSkge1xuICAgICAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGUsXG4gICAgICAgICAgICAgICAgX3N0YXRlJHNob3dPcHRpb25zID0gX3N0YXRlLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIHNob3dPcHRpb25zID0gX3N0YXRlJHNob3dPcHRpb25zID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9zdGF0ZSRzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0ID0gX3N0YXRlLmN1cnJlbnRUYXJnZXQ7XG5cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnM6ICFzaG93T3B0aW9ucyxcbiAgICAgICAgICAgICAgICBvcHRpb25zQW5jaG9yRWw6IGUuY3VycmVudFRhcmdldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5GaWxlUGlja2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5GaWxlUGlja2VyKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucmVmcy5kcm9wem9uZS5vcGVuKCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5Gb2xkZXJQaWNrZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbkZvbGRlclBpY2tlcihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnJlZnMuZHJvcHpvbmUub3BlbkZvbGRlclBpY2tlcigpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdkaWFsb2dTdWJtaXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZGlhbG9nU3VibWl0KG5ld1ZhbHVlLCBzYXZlVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBjb25maWdzID0gdGhpcy5zdGF0ZS5jb25maWdzO1xuXG4gICAgICAgICAgICBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCkuZ2V0SXRlbXMoKS5zZXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb24uZ2V0U3RhdHVzKCkgPT09ICdjb25maXJtJykge1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnByZXBhcmUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNhdmVWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2RpYWxvZ0NhbmNlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBkaWFsb2dDYW5jZWwoKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBzdG9yZS5nZXRJdGVtcygpLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbi5nZXRTdGF0dXMoKSA9PT0gJ2NvbmZpcm0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJlbW92ZVNlc3Npb24oc2Vzc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29uZmlybURpYWxvZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbigndXBsb2FkJyk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX3B5ZGlvMi5kZWZhdWx0LmdldEluc3RhbmNlKCkuTWVzc2FnZUhhc2g7XG4gICAgICAgICAgICB2YXIgY29ubmVjdERyb3BUYXJnZXQgPSB0aGlzLnByb3BzLmNvbm5lY3REcm9wVGFyZ2V0IHx8IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3MgPSBfc3RhdGUyLmNvbmZpZ3MsXG4gICAgICAgICAgICAgICAgc2hvd09wdGlvbnMgPSBfc3RhdGUyLnNob3dPcHRpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gX3N0YXRlMi5pdGVtcyxcbiAgICAgICAgICAgICAgICBzdG9yZVJ1bm5pbmcgPSBfc3RhdGUyLnN0b3JlUnVubmluZyxcbiAgICAgICAgICAgICAgICBjb25maXJtRGlhbG9nID0gX3N0YXRlMi5jb25maXJtRGlhbG9nO1xuXG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBVcGxvYWRlck1vZGVsLlN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICB2YXIgbGlzdEVtcHR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGl0ZW1zLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocy5nZXRDaGlsZHJlbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0RW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBmb2xkZXJCdXR0b24gPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgc3RhcnRCdXR0b24gPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgZSA9IGdsb2JhbC5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnZmlsZScpO1xuICAgICAgICAgICAgaWYgKCd3ZWJraXRkaXJlY3RvcnknIGluIGUpIHtcbiAgICAgICAgICAgICAgICBmb2xkZXJCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGljb246IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IHN0eWxlOiB7IGZvbnRTaXplOiAxNiB9LCBjbGFzc05hbWU6ICdtZGkgbWRpLWZvbGRlci1wbHVzJyB9KSwgcHJpbWFyeTogdHJ1ZSwgc3R5bGU6IHsgbWFyZ2luUmlnaHQ6IDEwIH0sIGxhYmVsOiBtZXNzYWdlc1snaHRtbF91cGxvYWRlci41J10sIG9uVG91Y2hUYXA6IHRoaXMub3BlbkZvbGRlclBpY2tlci5iaW5kKHRoaXMpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChzdG9yZVJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBzdGFydEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWNvbjogX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgc3R5bGU6IHsgZm9udFNpemU6IDE2IH0sIGNsYXNzTmFtZTogJ21kaSBtZGktcGF1c2UnIH0pLCBsYWJlbDogXCJQYXVzZVwiLCBvblRvdWNoVGFwOiB0aGlzLnBhdXNlLmJpbmQodGhpcyksIHNlY29uZGFyeTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RvcmUuaGFzUXVldWUoKSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1wbGF5JyB9KSwgbGFiZWw6IG1lc3NhZ2VzWydodG1sX3VwbG9hZGVyLjExJ10sIG9uVG91Y2hUYXA6IHRoaXMuc3RhcnQuYmluZCh0aGlzKSwgc2Vjb25kYXJ5OiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3REcm9wVGFyZ2V0KF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdyZWxhdGl2ZScsIGJhY2tncm91bmRDb2xvcjogJyNGQUZBRkEnIH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgICAgIHsgekRlcHRoOiAxLCBzdHlsZTogeyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZ0xlZnQ6IDYsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpY29uOiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBzdHlsZTogeyBmb250U2l6ZTogMTYgfSwgY2xhc3NOYW1lOiAnbWRpIG1kaS1maWxlLXBsdXMnIH0pLCBwcmltYXJ5OiB0cnVlLCBzdHlsZTogeyBtYXJnaW5SaWdodDogNiB9LCBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuNCddLCBvblRvdWNoVGFwOiB0aGlzLm9wZW5GaWxlUGlja2VyLmJpbmQodGhpcykgfSksXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlckJ1dHRvbixcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRCdXR0b24sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBzdHlsZTogeyBmbGV4OiAxIH0gfSksXG4gICAgICAgICAgICAgICAgICAgICFsaXN0RW1wdHkgJiYgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuMTInXSwgc3R5bGU6IHsgbWFyZ2luUmlnaHQ6IDAgfSwgcHJpbWFyeTogdHJ1ZSwgb25Ub3VjaFRhcDogdGhpcy5jbGVhci5iaW5kKHRoaXMpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3RzLXZlcnRpY2FsXCIsIGljb25TdHlsZTogeyBjb2xvcjogJyM5ZTllOWUnLCBmb250U2l6ZTogMTggfSwgc3R5bGU6IHsgcGFkZGluZzogMTQgfSwgdG9vbHRpcDogbWVzc2FnZXNbJ2h0bWxfdXBsb2FkZXIuMjInXSwgb25Ub3VjaFRhcDogdGhpcy50b2dnbGVPcHRpb25zLmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBGaWxlRHJvcFpvbmUsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyYW5zcGFyZW50LWRyb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2Ryb3B6b25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRm9sZGVyczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRDbGljazogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZ25vcmVOYXRpdmVEcm9wOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ecm9wOiB0aGlzLm9uRHJvcC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25Gb2xkZXJQaWNrZWQ6IHRoaXMub25Gb2xkZXJQaWNrZWQuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogNDIwIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX1RyYW5zZmVyc0xpc3QyLmRlZmF1bHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkRpc21pc3M6IHRoaXMucHJvcHMub25EaXNtaXNzXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfVXBsb2FkT3B0aW9uc1BhbmUyLmRlZmF1bHQsIHsgY29uZmlnczogY29uZmlncywgb3Blbjogc2hvd09wdGlvbnMsIGFuY2hvckVsOiB0aGlzLnN0YXRlLm9wdGlvbnNBbmNob3JFbCwgb25EaXNtaXNzOiBmdW5jdGlvbiBvbkRpc21pc3MoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnRvZ2dsZU9wdGlvbnMoZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgY29uZmlybURpYWxvZyAmJiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfQ29uZmlybUV4aXN0czIuZGVmYXVsdCwgeyBvbkNvbmZpcm06IHRoaXMuZGlhbG9nU3VibWl0LmJpbmQodGhpcyksIG9uQ2FuY2VsOiB0aGlzLmRpYWxvZ0NhbmNlbC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wVXBsb2FkZXI7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBEcm9wVXBsb2FkZXIgPSBkcm9wUHJvdmlkZXIoRHJvcFVwbG9hZGVyKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRHJvcFVwbG9hZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3BhdGggPSByZXF1aXJlKCdweWRpby91dGlsL3BhdGgnKTtcblxudmFyIF9wYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3BhdGgpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciB1cGxvYWRTdGF0dXNNZXNzYWdlcyA9IHtcbiAgICBcIm5ld1wiOiA0MzMsXG4gICAgXCJsb2FkaW5nXCI6IDQzNCxcbiAgICBcImxvYWRlZFwiOiA0MzUsXG4gICAgXCJlcnJvclwiOiA0MzZcbn07XG5cbnZhciBUcmFuc2ZlciA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFRyYW5zZmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFRyYW5zZmVyKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2Zlcik7XG5cbiAgICAgICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoVHJhbnNmZXIpKS5jYWxsKHRoaXMsIHByb3BzKSk7XG5cbiAgICAgICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIHNob3dBbGw6IGZhbHNlLFxuICAgICAgICAgICAgc3RhdHVzOiBwcm9wcy5pdGVtLmdldFN0YXR1cygpLFxuICAgICAgICAgICAgcHJldmlld1VybDogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiBwcm9wcy5pdGVtLmdldFByb2dyZXNzKCkgfHwgMFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFRyYW5zZmVyLCBbe1xuICAgICAgICBrZXk6ICdjb21wb25lbnREaWRNb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMucHJvcHMuaXRlbTtcblxuICAgICAgICAgICAgdGhpcy5fcGdPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHByb2dyZXNzOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9zdGF0dXNPYnNlcnZlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHN0YXR1czogdmFsdWUgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdwcm9ncmVzcycsIHRoaXMuX3BnT2JzZXJ2ZXIpO1xuICAgICAgICAgICAgaXRlbS5vYnNlcnZlKCdzdGF0dXMnLCB0aGlzLl9zdGF0dXNPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLm9ic2VydmUoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFVwbG9hZGVyTW9kZWwuVXBsb2FkSXRlbSAmJiAvXFwuKGpwZT9nfHBuZ3xnaWYpJC9pLnRlc3QoaXRlbS5nZXRGaWxlKCkubmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5wcmV2aWV3VXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcmV2aWV3VXJsOiBpdGVtLnByZXZpZXdVcmwgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5wcmV2aWV3VXJsID0gcmVhZGVyLnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcHJldmlld1VybDogcmVhZGVyLnJlc3VsdCB9KTtcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaXRlbS5nZXRGaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb21wb25lbnRXaWxsVW5tb3VudCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3Byb2dyZXNzJywgdGhpcy5fcGdPYnNlcnZlcik7XG4gICAgICAgICAgICBpdGVtLnN0b3BPYnNlcnZpbmcoJ3N0YXR1cycsIHRoaXMuX3N0YXR1c09ic2VydmVyKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcy5wcm9wcy5pdGVtO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5nZXRQYXJlbnQoKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZ2V0UGFyZW50KCkucmVtb3ZlQ2hpbGQoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2Fib3J0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLnByb3BzLml0ZW07XG5cbiAgICAgICAgICAgIGl0ZW0uYWJvcnQoKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcyxcbiAgICAgICAgICAgICAgICBpdGVtID0gX3Byb3BzLml0ZW0sXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gX3Byb3BzLmNsYXNzTmFtZSxcbiAgICAgICAgICAgICAgICBzdHlsZSA9IF9wcm9wcy5zdHlsZSxcbiAgICAgICAgICAgICAgICBsaW1pdCA9IF9wcm9wcy5saW1pdCxcbiAgICAgICAgICAgICAgICBsZXZlbCA9IF9wcm9wcy5sZXZlbCxcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zID0gX3Byb3BzLmV4dGVuc2lvbnM7XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcGVuID0gX3N0YXRlLm9wZW4sXG4gICAgICAgICAgICAgICAgc2hvd0FsbCA9IF9zdGF0ZS5zaG93QWxsLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gX3N0YXRlLnByb2dyZXNzLFxuICAgICAgICAgICAgICAgIHN0YXR1cyA9IF9zdGF0ZS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgcHJldmlld1VybCA9IF9zdGF0ZS5wcmV2aWV3VXJsO1xuXG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSBpdGVtLmdldENoaWxkcmVuKCk7XG4gICAgICAgICAgICB2YXIgaXNEaXIgPSBpdGVtIGluc3RhbmNlb2YgVXBsb2FkZXJNb2RlbC5Gb2xkZXJJdGVtO1xuICAgICAgICAgICAgdmFyIGlzUGFydCA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlBhcnRJdGVtO1xuICAgICAgICAgICAgdmFyIGlzU2Vzc2lvbiA9IGl0ZW0gaW5zdGFuY2VvZiBVcGxvYWRlck1vZGVsLlNlc3Npb247XG5cbiAgICAgICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgbWFpbjogX2V4dGVuZHMoe30sIHN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNDI0MjQyJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IChsZXZlbCAtIDEpICogMjAsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6IDEyLFxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAxMixcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCAjZWVlZWVlXCIsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3doaXRlJyxcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiBjaGlsZHJlbi5sZW5ndGggPyAncG9pbnRlcicgOiAnZGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6IGxldmVsID09PSAxID8gJzNweCBzb2xpZCB0cmFuc3BhcmVudCcgOiAnJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGVmdEljb246IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAzNixcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6ICcjNjE2MTYxJyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDE2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwcmV2aWV3SW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNlZWUnLFxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogJ2NvdmVyJyxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAyNCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiBpc0RpciA/IDUwMCA6IDQwMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGlzUGFydCA/ICcjOWU5ZTllJyA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZTogaXNQYXJ0ID8gJ2l0YWxpYycgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6IDFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVyck1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjZTUzOTM1JyxcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IDExLFxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcydcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBnQmFyOiB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA4MCxcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNDgsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM5ZTllOWUnLFxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogMTZcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRvZ2dsZUljb246IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYmRiZGJkJyxcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luTGVmdDogNFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBjaGlsZENvbXBzID0gW10sXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZU9wZW4gPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgcGdDb2xvciA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBlcnJNZXNzYWdlID0gdm9pZCAwO1xuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZW4gfHwgaXNTZXNzaW9uICYmIHN0YXR1cyAhPT0gJ2FuYWx5c2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzbGljZWQgPSBzaG93QWxsID8gY2hpbGRyZW4gOiBjaGlsZHJlbi5zbGljZSgwLCBsaW1pdCk7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkQ29tcHMgPSBzbGljZWQubWFwKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFRyYW5zZmVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBjaGlsZC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiBsaW1pdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXZlbDogbGV2ZWwgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnM6IGV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNsaWNlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkQ29tcHMucHVzaChfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGVzLmxpbmUsIHsgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlckxlZnQ6ICcnLCBwYWRkaW5nTGVmdDogbGV2ZWwgKiAyMCB9KSwgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IHNob3dBbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgc3R5bGU6IHN0eWxlcy5sZWZ0SWNvbiwgY2xhc3NOYW1lOiBcIm1kaSBtZGktcGx1cy1ib3gtb3V0bGluZVwiIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZmxleDogMSwgZm9udFN0eWxlOiAnaXRhbGljJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLmxlbmd0aCAtIHNsaWNlZC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgbW9yZSAtIHNob3cgYWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhbGxiYWNrID0gZnVuY3Rpb24gdG9nZ2xlQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMy5zZXRTdGF0ZSh7IG9wZW46ICFvcGVuIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdG9nZ2xlT3BlbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBvbkNsaWNrOiB0b2dnbGVDYWxsYmFjaywgc3R5bGU6IHN0eWxlcy50b2dnbGVJY29uLCBjbGFzc05hbWU6IFwibWRpIG1kaS1jaGV2cm9uLVwiICsgKG9wZW4gPyBcImRvd25cIiA6IFwicmlnaHRcIikgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc0Rpcikge1xuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IFwibWRpIG1kaS1mb2xkZXJcIjtcbiAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWRlbGV0ZScsIG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjNGNhZjUwJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUGFydCkge1xuICAgICAgICAgICAgICAgIGljb25DbGFzcyA9IFwibWRpIG1kaS1wYWNrYWdlLXVwXCI7XG4gICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzID09PSAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcGdDb2xvciA9ICcjNGNhZjUwJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBfc3RhdHVzID0gaXRlbS5nZXRTdGF0dXMoKTtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSBcIm1kaSBtZGktZmlsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcGF0aDIuZGVmYXVsdC5nZXRGaWxlRXh0ZW5zaW9uKGl0ZW0uZ2V0RnVsbFBhdGgoKSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuaGFzKGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9leHRlbnNpb25zJGdldCA9IGV4dGVuc2lvbnMuZ2V0KGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250SWNvbiA9IF9leHRlbnNpb25zJGdldC5mb250SWNvbjtcblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3MgPSAnbWltZWZvbnQgbWRpIG1kaS0nICsgZm9udEljb247XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF9zdGF0dXMgPT09ICdsb2FkaW5nJykge1xuICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvbiA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdzcGFuJywgeyBjbGFzc05hbWU6ICdtZGkgbWRpLXN0b3AnLCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnI2U1MzkzNSc7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJtZGkgbWRpLXJlc3RhcnRcIiwgc3R5bGU6IHsgY29sb3I6ICcjZTUzOTM1JyB9LCBvbkNsaWNrOiBmdW5jdGlvbiBvbkNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ucHJvY2VzcyhmdW5jdGlvbiAoKSB7fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBnQ29sb3IgPSAnIzRjYWY1MCc7XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0QnV0dG9uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktZGVsZXRlJywgb25DbGljazogZnVuY3Rpb24gb25DbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGxhYmVsID0gX3BhdGgyLmRlZmF1bHQuZ2V0QmFzZW5hbWUoaXRlbS5nZXRGdWxsUGF0aCgpKTtcbiAgICAgICAgICAgIHZhciBwcm9ncmVzc0JhciA9IF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkxpbmVhclByb2dyZXNzLCB7IHN0eWxlOiB7IGJhY2tncm91bmRDb2xvcjogJyNlZWVlZWUnIH0sIGNvbG9yOiBwZ0NvbG9yLCBtaW46IDAsIG1heDogMTAwLCB2YWx1ZTogcHJvZ3Jlc3MsIG1vZGU6IFwiZGV0ZXJtaW5hdGVcIiB9KTtcblxuICAgICAgICAgICAgaWYgKGlzU2Vzc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09ICdhbmFseXNlJykge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IF9weWRpbzIuZGVmYXVsdC5nZXRNZXNzYWdlcygpW1wiaHRtbF91cGxvYWRlci5hbmFseXplLnN0ZXBcIl07XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0b2dnbGVPcGVuID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRCdXR0b24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaXJjdWxhclByb2dyZXNzLCB7IHNpemU6IDE2LCB0aGlja25lc3M6IDIsIHN0eWxlOiB7IG1hcmdpblRvcDogMSB9IH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkQ29tcHNcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcmV2aWV3VXJsKSB7XG4gICAgICAgICAgICAgICAgbGVmdEljb24gPSBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7fSwgc3R5bGVzLmxlZnRJY29uLCB7IG1hcmdpblRvcDogLTQsIG1hcmdpbkJvdHRvbTogLTUgfSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgc3R5bGU6IF9leHRlbmRzKHsgYmFja2dyb3VuZDogJ3VybCgnICsgcHJldmlld1VybCArICcpJyB9LCBzdHlsZXMucHJldmlld0ltYWdlKSB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxlZnRJY29uID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogaWNvbkNsYXNzLCBzdHlsZTogc3R5bGVzLmxlZnRJY29uIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSAnZXJyb3InICYmIGl0ZW0uZ2V0RXJyb3JNZXNzYWdlKCkpIHtcbiAgICAgICAgICAgICAgICBlcnJNZXNzYWdlID0gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLmVyck1lc3NhZ2UsIHRpdGxlOiBpdGVtLmdldEVycm9yTWVzc2FnZSgpIH0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZ2V0RXJyb3JNZXNzYWdlKClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLm1haW4sIGNsYXNzTmFtZTogXCJ1cGxvYWQtXCIgKyBzdGF0dXMgKyBcIiBcIiArIChjbGFzc05hbWUgPyBjbGFzc05hbWUgOiBcIlwiKSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLmxpbmUgfSxcbiAgICAgICAgICAgICAgICAgICAgbGVmdEljb24sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBvbkNsaWNrOiB0b2dnbGVDYWxsYmFjaywgc3R5bGU6IHN0eWxlcy5sYWJlbCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVPcGVuXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGVyck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMucGdCYXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLnJpZ2h0QnV0dG9uIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICByaWdodEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBjaGlsZENvbXBzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRyYW5zZmVyO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVHJhbnNmZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfVHJhbnNmZXIgPSByZXF1aXJlKCcuL1RyYW5zZmVyJyk7XG5cbnZhciBfVHJhbnNmZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNmZXIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBUcmFuc2ZlcnNMaXN0ID0gZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoVHJhbnNmZXJzTGlzdCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBUcmFuc2ZlcnNMaXN0KHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2ZlcnNMaXN0KTtcblxuICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFRyYW5zZmVyc0xpc3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihUcmFuc2ZlcnNMaXN0KSkuY2FsbCh0aGlzLCBwcm9wcykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhUcmFuc2ZlcnNMaXN0LCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMucHJvcHMuaXRlbXM7XG5cbiAgICAgICAgICAgIHZhciBpc0VtcHR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChpdGVtcykge1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBfcHlkaW8yLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKS5SZWdpc3RyeS5nZXRGaWxlc0V4dGVuc2lvbnMoKTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzID0gaXRlbXMuc2Vzc2lvbnMubWFwKGZ1bmN0aW9uIChzZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXNzaW9uLmdldENoaWxkcmVuKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9UcmFuc2ZlcjIuZGVmYXVsdCwgeyBpdGVtOiBzZXNzaW9uLCBzdHlsZToge30sIGxpbWl0OiAxMCwgbGV2ZWw6IDAsIGV4dGVuc2lvbnM6IGV4dCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBoZWlnaHQ6ICcxMDAlJywgd2lkdGg6ICcxMDAlJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ2NlbnRlcicsIHdpZHRoOiAnMTAwJScsIGZvbnRXZWlnaHQ6IDUwMCwgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjEpJywgZm9udFNpemU6IDI0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9weWRpbzIuZGVmYXVsdC5nZXRNZXNzYWdlcygpW1wiaHRtbF91cGxvYWRlci5kcm9waGVyZVwiXVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICBvdmVyZmxvd1k6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2VlZWVlZSdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiBjb250YWluZXIgfSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFRyYW5zZmVyc0xpc3Q7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBUcmFuc2ZlcnNMaXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBVcGxvYWRPcHRpb25zUGFuZSA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKFVwbG9hZE9wdGlvbnNQYW5lLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIFVwbG9hZE9wdGlvbnNQYW5lKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkT3B0aW9uc1BhbmUpO1xuXG4gICAgICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoVXBsb2FkT3B0aW9uc1BhbmUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihVcGxvYWRPcHRpb25zUGFuZSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVcGxvYWRPcHRpb25zUGFuZSwgW3tcbiAgICAgICAga2V5OiAndXBkYXRlRmllbGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRmllbGQoZk5hbWUsIGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgY29uZmlncyA9IHRoaXMucHJvcHMuY29uZmlncztcblxuXG4gICAgICAgICAgICBpZiAoZk5hbWUgPT09ICdhdXRvc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZVN0YXJ0ID0gY29uZmlncy5nZXRPcHRpb25Bc0Jvb2woJ0RFRkFVTFRfQVVUT19TVEFSVCcsICd1cGxvYWRfYXV0b19zZW5kJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlU3RhcnQgPSAhdG9nZ2xlU3RhcnQ7XG4gICAgICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9hdXRvX3NlbmQnLCB0b2dnbGVTdGFydCwgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZOYW1lID09PSAnYXV0b2Nsb3NlJykge1xuICAgICAgICAgICAgICAgIHZhciBfdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX0NMT1NFJywgJ3VwbG9hZF9hdXRvX2Nsb3NlJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgX3RvZ2dsZVN0YXJ0ID0gIV90b2dnbGVTdGFydDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX2F1dG9fY2xvc2UnLCBfdG9nZ2xlU3RhcnQsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmTmFtZSA9PT0gJ2V4aXN0aW5nJykge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3MudXBkYXRlT3B0aW9uKCd1cGxvYWRfZXhpc3RpbmcnLCBldmVudC50YXJnZXQuZ2V0U2VsZWN0ZWRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZk5hbWUgPT09ICdzaG93X3Byb2Nlc3NlZCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlU2hvd1Byb2Nlc3NlZCA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdVUExPQURfU0hPV19QUk9DRVNTRUQnLCAndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZVNob3dQcm9jZXNzZWQgPSAhdG9nZ2xlU2hvd1Byb2Nlc3NlZDtcbiAgICAgICAgICAgICAgICBjb25maWdzLnVwZGF0ZU9wdGlvbigndXBsb2FkX3Nob3dfcHJvY2Vzc2VkJywgdG9nZ2xlU2hvd1Byb2Nlc3NlZCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmFuZG9tOiBNYXRoLnJhbmRvbSgpIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyYWRpb0NoYW5nZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWRpb0NoYW5nZShlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cblxuICAgICAgICAgICAgY29uZmlncy51cGRhdGVPcHRpb24oJ3VwbG9hZF9leGlzdGluZycsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByYW5kb206IE1hdGgucmFuZG9tKCkgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNvbmZpZ3MgPSB0aGlzLnByb3BzLmNvbmZpZ3M7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzIuZGVmYXVsdC5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICB2YXIgdG9nZ2xlU3RhcnQgPSBjb25maWdzLmdldE9wdGlvbkFzQm9vbCgnREVGQVVMVF9BVVRPX1NUQVJUJywgJ3VwbG9hZF9hdXRvX3NlbmQnKTtcbiAgICAgICAgICAgIHZhciB0b2dnbGVDbG9zZSA9IGNvbmZpZ3MuZ2V0T3B0aW9uQXNCb29sKCdERUZBVUxUX0FVVE9fQ0xPU0UnLCAndXBsb2FkX2F1dG9fY2xvc2UnKTtcbiAgICAgICAgICAgIHZhciBvdmVyd3JpdGVUeXBlID0gY29uZmlncy5nZXRPcHRpb24oJ0RFRkFVTFRfRVhJU1RJTkcnLCAndXBsb2FkX2V4aXN0aW5nJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Qb3BvdmVyLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbjogdGhpcy5wcm9wcy5vcGVuLFxuICAgICAgICAgICAgICAgICAgICBhbmNob3JFbDogdGhpcy5wcm9wcy5hbmNob3JFbCxcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdyaWdodCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9LFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRPcmlnaW46IHsgaG9yaXpvbnRhbDogJ3JpZ2h0JywgdmVydGljYWw6ICd0b3AnIH0sXG4gICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdENsb3NlOiBmdW5jdGlvbiBvblJlcXVlc3RDbG9zZShlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvcHMub25EaXNtaXNzKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6IDMyMCwgcGFkZGluZ0JvdHRvbTogNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuU3ViaGVhZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdPcHRpb25zJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCAxNnB4JywgbWFyZ2luVG9wOiAtNiB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBzdHlsZTogeyBtYXJnaW46ICc4cHggMCcgfSwgY2hlY2tlZDogdG9nZ2xlU3RhcnQsIGxhYmVsUG9zaXRpb246IFwicmlnaHRcIiwgb25DaGVjazogdGhpcy51cGRhdGVGaWVsZC5iaW5kKHRoaXMsICdhdXRvc3RhcnQnKSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzMzN10sIGxhYmVsU3R5bGU6IHsgZm9udFNpemU6IDE0IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBzdHlsZTogeyBtYXJnaW46ICc4cHggMCcgfSwgY2hlY2tlZDogdG9nZ2xlQ2xvc2UsIGxhYmVsUG9zaXRpb246IFwicmlnaHRcIiwgb25DaGVjazogdGhpcy51cGRhdGVGaWVsZC5iaW5kKHRoaXMsICdhdXRvY2xvc2UnKSwgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzMzOF0sIGxhYmVsU3R5bGU6IHsgZm9udFNpemU6IDE0IH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5TdWJoZWFkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZyddXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6IDE2LCBmb250U2l6ZTogMTQsIHBhZGRpbmdUb3A6IDAgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUmFkaW9CdXR0b25Hcm91cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ2dyb3VwJywgbmFtZTogJ3NoaXBTcGVlZCcsIGRlZmF1bHRTZWxlY3RlZDogb3ZlcndyaXRlVHlwZSwgb25DaGFuZ2U6IHRoaXMucmFkaW9DaGFuZ2UuYmluZCh0aGlzKSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAnYWxlcnQnLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbJ2h0bWxfdXBsb2FkZXIub3B0aW9ucy5leGlzdGluZy5hbGVydCddLCBzdHlsZTogeyBwYWRkaW5nQm90dG9tOiA4IH0gfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0Mi5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuUmFkaW9CdXR0b24sIHsgdmFsdWU6ICdyZW5hbWUtZm9sZGVycycsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsnaHRtbF91cGxvYWRlci5vcHRpb25zLmV4aXN0aW5nLmZvbGRlcnMnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAncmVuYW1lJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3RpbmcubWVyZ2UnXSwgc3R5bGU6IHsgcGFkZGluZ0JvdHRvbTogOCB9IH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlJhZGlvQnV0dG9uLCB7IHZhbHVlOiAnb3ZlcndyaXRlJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWydodG1sX3VwbG9hZGVyLm9wdGlvbnMuZXhpc3Rpbmcub3ZlcndyaXRlJ10gfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXBsb2FkT3B0aW9uc1BhbmU7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBVcGxvYWRPcHRpb25zUGFuZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuVHJhbnNmZXJzTGlzdCA9IGV4cG9ydHMuRHJvcFVwbG9hZGVyID0gdW5kZWZpbmVkO1xuXG52YXIgX0Ryb3BVcGxvYWRlciA9IHJlcXVpcmUoJy4vRHJvcFVwbG9hZGVyJyk7XG5cbnZhciBfRHJvcFVwbG9hZGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0Ryb3BVcGxvYWRlcik7XG5cbnZhciBfVHJhbnNmZXJzTGlzdCA9IHJlcXVpcmUoJy4vVHJhbnNmZXJzTGlzdCcpO1xuXG52YXIgX1RyYW5zZmVyc0xpc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNmZXJzTGlzdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuRHJvcFVwbG9hZGVyID0gX0Ryb3BVcGxvYWRlcjIuZGVmYXVsdDtcbmV4cG9ydHMuVHJhbnNmZXJzTGlzdCA9IF9UcmFuc2ZlcnNMaXN0Mi5kZWZhdWx0O1xuIl19
