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

var _TransferFolder = require('./TransferFolder');

var _TransferFolder2 = _interopRequireDefault(_TransferFolder);

var _TransferFile = require('./TransferFile');

var _TransferFile2 = _interopRequireDefault(_TransferFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransfersList = function (_React$Component) {
    _inherits(TransfersList, _React$Component);

    function TransfersList() {
        _classCallCheck(this, TransfersList);

        return _possibleConstructorReturn(this, (TransfersList.__proto__ || Object.getPrototypeOf(TransfersList)).apply(this, arguments));
    }

    _createClass(TransfersList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var store = UploaderModel.Store.getInstance();
            this._storeObserver = function () {
                this.setState({ items: store.getItems() });
            }.bind(this);
            store.observe("update", this._storeObserver);
            store.observe("auto_close", function () {
                if (this.props.onDismiss) {
                    this.props.onDismiss();
                }
            }.bind(this));
            this.setState({ items: store.getItems() });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var autoStart = nextProps.autoStart;
            var items = this.state.items;


            if (autoStart && items["pending"].length) {
                UploaderModel.Store.getInstance().processNext();
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
        key: 'renderSection',
        value: function renderSection(accumulator, items) {
            var _this2 = this;

            var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
            var className = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
            var showAll = this.state.showAll;

            if (title && items.length) {
                accumulator.push(_react2.default.createElement(
                    'div',
                    { className: className + " header" },
                    title
                ));
            }
            items.sort(function (a, b) {
                var aType = a instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                var bType = b instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                if (aType === bType) {
                    return 0;
                } else {
                    return aType === 'folder' ? -1 : 1;
                }
            });
            var limit = 50;
            var sliced = showAll ? items : items.slice(0, limit);
            sliced.forEach(function (f) {
                if (f instanceof UploaderModel.FolderItem) {
                    accumulator.push(_react2.default.createElement(_TransferFolder2.default, { key: f.getId(), item: f, className: className }));
                } else {
                    accumulator.push(_react2.default.createElement(_TransferFile2.default, { key: f.getId(), item: f, className: className }));
                }
            });
            if (!showAll && items.length > limit) {
                accumulator.push(_react2.default.createElement(
                    'div',
                    { style: { cursor: 'pointer' }, className: className, onClick: function onClick() {
                            _this2.setState({ showAll: true });
                        } },
                    'And ',
                    items.length - limit,
                    ' more ...'
                ));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var items = [];
            if (this.state && this.state.items) {
                this.renderSection(items, this.state.items.processing, _pydio2.default.getInstance().MessageHash['html_uploader.14'], 'section-processing');
                this.renderSection(items, this.state.items.pending, _pydio2.default.getInstance().MessageHash['html_uploader.15'], 'section-pending');
                this.renderSection(items, this.state.items.errors, _pydio2.default.getInstance().MessageHash['html_uploader.23'], 'section-errors');
                this.renderSection(items, this.state.items.processed, _pydio2.default.getInstance().MessageHash['html_uploader.16'], 'section-processed');
            }
            return _react2.default.createElement(
                'div',
                { id: 'upload_files_list', style: { height: '100%' }, className: UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : '' },
                items
            );
        }
    }]);

    return TransfersList;
}(_react2.default.Component);

exports.default = TransfersList;
