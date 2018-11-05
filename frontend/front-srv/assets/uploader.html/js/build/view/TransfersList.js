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

var _lang = require('pydio/util/lang');

var _lang2 = _interopRequireDefault(_lang);

var _materialUi = require('material-ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransfersList = function (_React$Component) {
    _inherits(TransfersList, _React$Component);

    function TransfersList(props) {
        _classCallCheck(this, TransfersList);

        var _this = _possibleConstructorReturn(this, (TransfersList.__proto__ || Object.getPrototypeOf(TransfersList)).call(this, props));

        _this.state = { showAll: false };
        return _this;
    }

    _createClass(TransfersList, [{
        key: 'sortItems',
        value: function sortItems(items) {
            items.sort(function (a, b) {
                var aType = a instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                var bType = b instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                if (aType === bType) {
                    if (a.getFullPath() === b.getFullPath()) return 0;else return a.getFullPath() > b.getFullPath() ? 1 : -1;
                } else {
                    return aType === 'folder' ? -1 : 1;
                }
            });
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
        key: 'renderSessionSection',
        value: function renderSessionSection(accumulator, sessions) {
            var title = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
            var className = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

            if (sessions && sessions.length) {
                accumulator.push(_react2.default.createElement(
                    'div',
                    { className: className + " header" },
                    title
                ));
                sessions.forEach(function (session, i) {
                    accumulator.push(_react2.default.createElement(
                        'div',
                        { key: "session-" + i, style: { display: 'flex', alignItems: 'center' } },
                        _react2.default.createElement('span', { className: "mdi mdi-timer-sand", style: { margin: '0 6px' } }),
                        _react2.default.createElement(
                            'span',
                            { style: { flex: 1 } },
                            session.sessionStatus()
                        )
                    ));
                });
            }
        }
    }, {
        key: 'treeView',
        value: function treeView(merged) {
            var tree = [];
            Object.keys(merged).forEach(function (path) {

                var pathParts = path.split('/');
                pathParts.shift();
                var currentLevel = tree;
                pathParts.forEach(function (part) {
                    var existingPath = currentLevel.find(function (data) {
                        return data.name === part;
                    });
                    if (existingPath) {
                        currentLevel = existingPath.children;
                    } else {
                        var newPart = {
                            name: part,
                            item: merged[path],
                            children: []
                        };
                        currentLevel.push(newPart);
                        currentLevel = newPart.children;
                    }
                });
            });
            return tree;
        }
    }, {
        key: 'render',
        value: function render() {
            var components = [];
            var items = this.props.items;
            var showAll = this.state.showAll;

            if (items) {

                this.renderSessionSection(components, items.sessions, 'Processing files', 'section-processing');


                var merged = {};
                var all = [].concat(_toConsumableArray(items.processing), _toConsumableArray(items.pending), _toConsumableArray(items.errors), _toConsumableArray(items.processed));
                this.sortItems(all);
                all.forEach(function (item) {
                    merged[item.getFullPath()] = item;
                });

                var tree = this.treeView(merged);
                console.log(tree);

                if (tree.length) {
                    components.push(_react2.default.createElement(_TransferFolder2.default, { children: tree, style: { paddingLeft: 0, marginLeft: -20 }, showAll: false, limit: 10 }));
                }
            }

            var container = {
                height: '100%',
                overflowY: 'auto',
                margin: '0 -10px',
                backgroundColor: '#FAFAFA',
                padding: 16
            };

            return _react2.default.createElement(
                'div',
                { style: container, className: UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : '' },
                components
            );
        }
    }]);

    return TransfersList;
}(_react2.default.Component);

exports.default = TransfersList;
