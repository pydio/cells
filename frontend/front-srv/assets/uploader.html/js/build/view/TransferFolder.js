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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TransferFolder = function (_React$Component) {
    _inherits(TransferFolder, _React$Component);

    function TransferFolder() {
        _classCallCheck(this, TransferFolder);

        return _possibleConstructorReturn(this, (TransferFolder.__proto__ || Object.getPrototypeOf(TransferFolder)).apply(this, arguments));
    }

    _createClass(TransferFolder, [{
        key: 'render',
        value: function render() {
            var statusMessage = void 0;
            if (this.props.item.getStatus() === 'loaded') {
                statusMessage = _pydio2.default.getInstance().MessageHash['html_uploader.13'];
            }
            return _react2.default.createElement(
                'div',
                { className: "folder-row upload-" + this.props.item.getStatus() + " " + (this.props.className ? this.props.className : "") },
                _react2.default.createElement('span', { className: 'mdi mdi-folder' }),
                ' ',
                this.props.item.getPath(),
                ' ',
                _react2.default.createElement(
                    'span',
                    { className: 'status' },
                    statusMessage
                )
            );
        }
    }]);

    return TransferFolder;
}(_react2.default.Component);

exports.default = TransferFolder;
