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

var _styles = require('material-ui/styles');

var _dom = require('pydio/util/dom');

var _dom2 = _interopRequireDefault(_dom);

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
            var _props = this.props,
                sessions = _props.sessions,
                store = _props.store,
                muiTheme = _props.muiTheme,
                onPickFile = _props.onPickFile,
                onPickFolder = _props.onPickFolder;

            var transition = _dom2.default.getBeziersTransition().replace('all ', 'color ');
            var messages = _pydio2.default.getMessages();
            var css = '\n            .drop-transfer-list{\n                color:rgba(3, 169, 244, 0.5);\n            }\n            .transparent-dropzone.active .drop-transfer-list{\n                color:rgba(3, 169, 244, 0.8);\n            }\n            .drop-transfer-list a,.drop-transfer-list a:hover {\n                color:rgba(3, 169, 244, 1);\n                cursor: pointer;\n            }\n        ';

            var sessionsList = void 0;
            if (sessions) {
                var isEmpty = true;
                var ext = _pydio2.default.getInstance().Registry.getFilesExtensions();
                var components = sessions.map(function (session) {
                    if (session.getChildren().length) {
                        isEmpty = false;
                    }
                    return _react2.default.createElement(_Transfer2.default, { item: session, store: store, style: {}, limit: 10, level: 0, extensions: ext });
                });
                if (!isEmpty) {
                    sessionsList = _react2.default.createElement(
                        'div',
                        { style: { height: '100%', overflowY: 'auto', padding: 10, paddingBottom: 20 } },
                        components
                    );
                }
            }

            var dropper = _react2.default.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', height: '100%', width: '100%', backgroundColor: '#F5F5F5', transition: transition }, className: "drop-transfer-list" },
                _react2.default.createElement(
                    'div',
                    { style: { textAlign: 'center', width: '100%', fontWeight: 500, fontSize: 18, padding: 24, lineHeight: '28px' } },
                    _react2.default.createElement('div', { className: 'mdi mdi-cloud-upload', style: { fontSize: 110 } }),
                    _react2.default.createElement(
                        'div',
                        null,
                        messages["html_uploader.drophere"],
                        ' ',
                        messages["html_uploader.drop-or"],
                        ' ',
                        _react2.default.createElement(
                            'a',
                            { onClick: onPickFile },
                            messages["html_uploader.drop-pick-file"]
                        ),
                        onPickFolder && _react2.default.createElement(
                            'span',
                            null,
                            ' ',
                            messages["html_uploader.drop-or"],
                            ' ',
                            _react2.default.createElement(
                                'a',
                                { onClick: onPickFolder },
                                messages["html_uploader.drop-pick-folder"]
                            )
                        )
                    )
                ),
                _react2.default.createElement('style', { type: "text/css", dangerouslySetInnerHTML: { __html: css } })
            );

            return _react2.default.createElement(
                'div',
                { style: { display: 'flex', height: '100%', overflow: 'hidden' } },
                _react2.default.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' } },
                    dropper
                ),
                sessionsList && _react2.default.createElement(
                    'div',
                    { style: { width: 420, minWidth: 420, maxWidth: 420 } },
                    sessionsList
                )
            );
        }
    }]);

    return TransfersList;
}(_react2.default.Component);

exports.default = TransfersList = (0, _styles.muiThemeable)()(TransfersList);
exports.default = TransfersList;
