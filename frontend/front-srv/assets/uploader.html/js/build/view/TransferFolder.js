'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _path = require('pydio/util/path');

var _path2 = _interopRequireDefault(_path);

var _TransferFile = require('./TransferFile');

var _TransferFile2 = _interopRequireDefault(_TransferFile);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransferFolder = function (_React$Component) {
    _inherits(TransferFolder, _React$Component);

    function TransferFolder(props) {
        _classCallCheck(this, TransferFolder);

        var _this = _possibleConstructorReturn(this, (TransferFolder.__proto__ || Object.getPrototypeOf(TransferFolder)).call(this, props));

        _this.state = { open: false };
        return _this;
    }

    _createClass(TransferFolder, [{
        key: 'recursivePg',
        value: function recursivePg(children) {
            var _this2 = this;

            var accu = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            if (!children.length) {
                return;
            }
            children.forEach(function (entry) {
                if (entry.item instanceof UploaderModel.FolderItem) {
                    _this2.recursivePg(entry.children, accu);
                } else {
                    accu.push(entry.item.getProgress());
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                item = _props.item,
                children = _props.children,
                className = _props.className,
                style = _props.style,
                showAll = _props.showAll,
                limit = _props.limit;
            var open = this.state.open;


            var statusMessage = void 0,
                childComps = [],
                folderProgress = void 0;

            if (children && children.length) {
                if (open || !item) {
                    var sliced = showAll ? children : children.slice(0, limit);
                    sliced.forEach(function (entry) {
                        if (entry.item instanceof UploaderModel.FolderItem) {
                            childComps.push(_react2.default.createElement(TransferFolder, { key: entry.item.getId(), item: entry.item, children: entry.children, showAll: showAll, limit: limit }));
                        } else {
                            childComps.push(_react2.default.createElement(_TransferFile2.default, { key: entry.item.getId(), item: entry.item }));
                        }
                    });
                } else if (!open) {
                    var accu = [];
                    this.recursivePg(children, accu);
                    if (accu.length) {
                        var sum = accu.reduce(function (a, b) {
                            return a + b;
                        });
                        var avg = sum / accu.length;
                        folderProgress = _react2.default.createElement(
                            'div',
                            { style: { width: 60 } },
                            _react2.default.createElement(_materialUi.LinearProgress, { style: { backgroundColor: '#eeeeee' }, mode: "determinate", min: 0, max: 100, value: avg })
                        );
                    }
                }
            }
            if (!item) {
                return _react2.default.createElement(
                    'div',
                    { style: style },
                    childComps
                );
            }

            if (item.getStatus() === 'loaded') {
                statusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.13'];
            }
            return _react2.default.createElement(
                'div',
                { style: _extends({ paddingLeft: 20 }, style, { fontSize: 14, color: '#424242' }), className: "upload-" + item.getStatus() + " " + (className ? className : "") },
                _react2.default.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', paddingTop: 3, paddingBottom: 3 }, onClick: function onClick() {
                            _this3.setState({ open: !open });
                        } },
                    _react2.default.createElement('span', { className: "mdi mdi-folder", style: { display: 'inline-block', width: 26, textAlign: 'center' } }),
                    _react2.default.createElement(
                        'span',
                        null,
                        _path2.default.getBasename(item.getPath())
                    ),
                    _react2.default.createElement('span', { className: "mdi mdi-chevron-" + (open ? "down" : "right") }),
                    _react2.default.createElement(
                        'span',
                        { className: 'status' },
                        statusMessage
                    ),
                    _react2.default.createElement('span', { style: { flex: 1 } }),
                    folderProgress
                ),
                childComps
            );
        }
    }]);

    return TransferFolder;
}(_react2.default.Component);

exports.default = TransferFolder;
