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
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var configs = this.props.configs;

            var pydio = _pydio2.default.getInstance();

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
                    { style: { width: 126 }, desktop: true },
                    _react2.default.createElement(
                        _materialUi.Subheader,
                        { style: { lineHeight: '26px' } },
                        pydio.MessageHash['html_uploader.12']
                    ),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: "Finished", onTouchTap: function onTouchTap() {
                            _this2.clear('loaded');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: "Failed", onTouchTap: function onTouchTap() {
                            _this2.clear('error');
                        } }),
                    _react2.default.createElement(_materialUi.MenuItem, { primaryText: "All Transfers", onTouchTap: function onTouchTap() {
                            _this2.clear('all');
                        } })
                )
            );
        }
    }]);

    return ClearOptionsPane;
}(_react2.default.Component);

exports.default = ClearOptionsPane;
