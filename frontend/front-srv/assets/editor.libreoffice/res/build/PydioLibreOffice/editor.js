'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class; /*
                   * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
                   * This file is part of Pydio.
                   *
                   * Pydio is free software: you can redistribute it and/or modify
                   * it under the terms of the GNU Affero General Public License as published by
                   * the Free Software Foundation, either version 3 of the License, or
                   * (at your option) any later version.
                   *
                   * Pydio is distributed in the hope that it will be useful,
                   * but WITHOUT ANY WARRANTY; without even the implied warranty of
                   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                   * GNU Affero General Public License for more details.
                   *
                   * You should have received a copy of the GNU Affero General Public License
                   * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
                   *
                   * The latest code can be found at <https://pydio.com>.
                   */

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _api = require('pydio/http/api');

var _api2 = _interopRequireDefault(_api);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var configs = _pydio2.default.getInstance().getPluginConfigs("editor.libreoffice");

var _Pydio$requireLib = _pydio2.default.requireLib('hoc'),
    withMenu = _Pydio$requireLib.withMenu,
    withLoader = _Pydio$requireLib.withLoader,
    withErrors = _Pydio$requireLib.withErrors,
    EditorActions = _Pydio$requireLib.EditorActions;

// const Viewer = compose(
//     withMenu,
//     withLoader,
//     withErrors
// )(({url, style}) => <iframe src={url} style={{...style, width: "100%", height: "100%", border: 0, flex: 1}}></iframe>)

var Editor = (_dec = (0, _reactRedux.connect)(null, EditorActions), _dec(_class = function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Editor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editorModify = this.props.editorModify;

            if (nextProps.isActive) {
                editorModify({ fixedToolbar: true });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var editorModify = this.props.editorModify;

            if (this.props.isActive) {
                editorModify({ fixedToolbar: true });
            }

            var iframeUrl = configs.get('LIBREOFFICE_IFRAME_URL');
            var host = _pydio2.default.Parameters('FRONTEND_URL');
            var webSocketUrl = host.replace(/^http/gi, 'ws');

            // Check current action state for permission
            var readonly = _pydio2.default.getInstance().getController().getActionByName("move").deny;
            var permission = readonly ? "readonly" : "edit";
            var uri = "/wopi/files/" + this.props.node.getMetadata().get("uuid");
            var fileSrcUrl = encodeURIComponent('' + host + uri);

            _api2.default.getRestClient().getOrUpdateJwt().then(function (jwt) {
                _this2.setState({ url: iframeUrl + '?host=' + webSocketUrl + '&WOPISrc=' + fileSrcUrl + '&access_token=' + jwt + '&permission=' + permission });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var url = this.state.url;

            return _react2.default.createElement('iframe', { src: url, style: { backgroundColor: "white", width: "100%", height: "100%", border: 0, flex: 1 } });
        }
    }]);

    return Editor;
}(_react2.default.Component)) || _class);
exports.default = Editor;
