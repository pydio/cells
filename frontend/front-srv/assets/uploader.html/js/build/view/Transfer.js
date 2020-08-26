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
