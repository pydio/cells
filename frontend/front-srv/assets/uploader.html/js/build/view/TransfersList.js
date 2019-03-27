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
