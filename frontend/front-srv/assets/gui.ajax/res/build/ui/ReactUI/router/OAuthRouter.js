/*
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
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _materialUi = require('material-ui');

var _reactRouterLibBrowserHistory = require('react-router/lib/browserHistory');

var _reactRouterLibBrowserHistory2 = _interopRequireDefault(_reactRouterLibBrowserHistory);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var OAuthLoginRouter = function OAuthLoginRouter(pydio) {
    return (function (_PureComponent) {
        _inherits(_class, _PureComponent);

        function _class(props) {
            _classCallCheck(this, _class);

            _PureComponent.call(this, props);

            var parsed = _queryString2['default'].parse(location.search);

            this.state = parsed;
        }

        _class.prototype.render = function render() {
            var _state = this.state;
            var login_challenge = _state.login_challenge;
            var error = _state.error;

            _pydioHttpApi2['default'].getRestClient().jwtWithAuthInfo({ type: "external", challenge: login_challenge });

            return _react2['default'].createElement(
                'div',
                null,
                error && _react2['default'].createElement(ErrorDialog, this.state),
                this.props.children
            );
        };

        return _class;
    })(_react.PureComponent);
};

exports.OAuthLoginRouter = OAuthLoginRouter;
var OAuthOOBRouter = function OAuthOOBRouter(pydio) {
    return (function (_PureComponent2) {
        _inherits(_class2, _PureComponent2);

        function _class2(props) {
            _classCallCheck(this, _class2);

            _PureComponent2.call(this, props);
            var parsed = _queryString2['default'].parse(location.search);
            this.state = _extends({}, parsed);
        }

        _class2.prototype.render = function render() {
            var code = this.state.code;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(ErrorDialog, _extends({}, this.state, {
                    successText: _pydio2['default'].getMessages()['ajax_gui.oauth.authentication.code'],
                    copyText: code
                })),
                this.props.children
            );
        };

        return _class2;
    })(_react.PureComponent);
};

exports.OAuthOOBRouter = OAuthOOBRouter;
var OAuthFallbacksRouter = function OAuthFallbacksRouter(pydio) {
    return (function (_PureComponent3) {
        _inherits(_class3, _PureComponent3);

        function _class3(props) {
            _classCallCheck(this, _class3);

            _PureComponent3.call(this, props);
            var parsed = _queryString2['default'].parse(location.search);
            this.state = _extends({}, parsed);
        }

        _class3.prototype.render = function render() {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(ErrorDialog, this.state),
                this.props.children
            );
        };

        return _class3;
    })(_react.PureComponent);
};

exports.OAuthFallbacksRouter = OAuthFallbacksRouter;

var ErrorDialog = (function (_Component) {
    _inherits(ErrorDialog, _Component);

    function ErrorDialog(props) {
        _classCallCheck(this, ErrorDialog);

        _Component.call(this, props);
        this.state = { open: true };
    }

    ErrorDialog.prototype.componentDidMount = function componentDidMount() {
        var copyText = this.props.copyText;

        if (copyText) {
            this.attachClipboard(copyText);
        }
    };

    ErrorDialog.prototype.dismiss = function dismiss() {
        this.setState({ open: false });
        _reactRouterLibBrowserHistory2['default'].push('/login');
    };

    ErrorDialog.prototype.getMessage = function getMessage(id) {
        return _pydio2['default'].getMessages()['ajax_gui.oauth.authentication.' + id] || id;
    };

    ErrorDialog.prototype.attachClipboard = function attachClipboard(inputValue) {
        if (this._clip) {
            this._clip.destroy();
        }
        if (!this.refs['copy-button']) {
            return;
        }
        this._clip = new _clipboard2['default'](this.refs['copy-button'], {
            text: (function (trigger) {
                return inputValue;
            }).bind(this)
        });
        this._clip.on('success', (function () {
            this.setState({ copyMessage: this.getMessage('code-copied') }, this.clearCopyMessage.bind(this));
        }).bind(this));
        this._clip.on('error', (function () {
            this.refs['input'].focus();
            this.setState({ copyMessage: this.getMessage('code-copy-failed') }, this.clearCopyMessage.bind(this));
        }).bind(this));
    };

    ErrorDialog.prototype.clearCopyMessage = function clearCopyMessage() {
        window.setTimeout((function () {
            this.setState({ copyMessage: '' });
        }).bind(this), 3000);
    };

    ErrorDialog.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var error = _props.error;
        var error_description = _props.error_description;
        var error_hint = _props.error_hint;
        var successText = _props.successText;
        var copyText = _props.copyText;
        var _state2 = this.state;
        var open = _state2.open;
        var copyMessage = _state2.copyMessage;

        var copyButtonStyle = {
            fontSize: 20,
            margin: 10,
            color: '#03a9f4',
            height: 26,
            width: 26,
            lineHeight: '28px',
            textAlign: 'center',
            cursor: 'pointer'
        };

        return _react2['default'].createElement(
            _materialUi.Dialog,
            {
                open: open,
                modal: false,
                title: error ? this.getMessage('failed') : this.getMessage('success'),
                actions: [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: _pydio2['default'].getMessages()['48'], onTouchTap: function () {
                        _this.dismiss();
                    } })]
            },
            _react2['default'].createElement(
                'div',
                null,
                successText && _react2['default'].createElement(
                    'div',
                    null,
                    successText
                ),
                copyText && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { display: 'flex', width: '100%' } },
                        _react2['default'].createElement(
                            'div',
                            { style: { flex: 1 } },
                            _react2['default'].createElement(ModernTextField, { ref: "input", value: copyText, fullWidth: true, onClick: function (e) {
                                    e.currentTarget.select();
                                } })
                        ),
                        _react2['default'].createElement('span', { style: copyButtonStyle, title: this.getMessage('copy-code'), ref: "copy-button", className: "mdi mdi-content-copy" })
                    ),
                    copyMessage && _react2['default'].createElement(
                        'div',
                        null,
                        copyMessage
                    )
                ),
                error && _react2['default'].createElement(
                    'div',
                    null,
                    error_description
                ),
                error_hint && _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 12, marginTop: 8 } },
                    error_hint
                )
            )
        );
    };

    return ErrorDialog;
})(_react.Component);
