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

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var ErrorDialog = (function (_Component) {
    _inherits(ErrorDialog, _Component);

    function ErrorDialog() {
        _classCallCheck(this, ErrorDialog);

        _Component.apply(this, arguments);
    }

    ErrorDialog.prototype.dismiss = function dismiss() {
        this.setState({ open: false });
        _reactRouterLibBrowserHistory2['default'].push('/login');
    };

    ErrorDialog.prototype.render = function render() {
        var _this = this;

        var _props = this.props;
        var error = _props.error;
        var error_description = _props.error_description;
        var error_hint = _props.error_hint;
        var successText = _props.successText;
        var copyText = _props.copyText;

        var open = true;
        if (this.state && this.state.open !== undefined) {
            open = this.state.open;
        }
        return _react2['default'].createElement(
            _materialUi.Dialog,
            {
                open: open,
                modal: false,
                title: error ? "Authentication Error" : "Authentication Success",
                actions: [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: "OK", onTouchTap: function () {
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
                copyText && _react2['default'].createElement(ModernTextField, { value: copyText, fullWidth: true, focusOnMount: true }),
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

var OAuthLoginRouter = function OAuthLoginRouter(pydio) {
    return (function (_PureComponent) {
        _inherits(_class, _PureComponent);

        function _class(props) {
            _classCallCheck(this, _class);

            _PureComponent.call(this, props);

            var parsed = _queryString2['default'].parse(location.search);

            this.loginChallenge = parsed.login_challenge;
            this.state = parsed;

            localStorage.setItem("loginOrigin", props.location.pathname + props.location.search);
        }

        _class.prototype.authorize = function authorize() {

            var loginChallenge = this.loginChallenge;

            _pydioHttpApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
                var body = {
                    subject: pydio.user.id
                };

                fetch('/oidc/admin/oauth2/auth/requests/login/accept?' + _queryString2['default'].stringify({ login_challenge: loginChallenge }), {
                    method: 'PUT',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                }).then(function (response) {
                    return response.json();
                }).then(function (response) {
                    // The response will contain a `redirect_to` key which contains the URL where the user's user agent must be redirected to next.
                    window.location.replace(response.redirect_to);
                });
            });
        };

        _class.prototype.render = function render() {
            var _this2 = this;

            if (pydio.user) {
                this.authorize();
                return null;
            }
            var error = this.state.error;

            pydio.observe('user_logged', function (u) {
                return u && _this2.authorize();
            });

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
var OAuthConsentRouter = function OAuthConsentRouter(pydio) {
    return (function (_PureComponent2) {
        _inherits(_class2, _PureComponent2);

        function _class2(props) {
            _classCallCheck(this, _class2);

            _PureComponent2.call(this, props);

            var parsed = _queryString2['default'].parse(location.search);

            this.consentChallenge = parsed.consent_challenge;
            this.state = parsed;
        }

        _class2.prototype.authorize = function authorize() {

            var consentChallenge = this.consentChallenge;

            _pydioHttpApi2['default'].getRestClient().getOrUpdateJwt().then(function (jwt) {
                var body = {
                    // A list of permissions the user granted to the OAuth 2.0 Client. This can be fewer permissions that initially requested, but are rarely more or other permissions than requested.
                    grant_scope: ["openid", "profile", "email", "pydio", "offline"],

                    // Sets the audience the user authorized the client to use. Should be a subset of `requested_access_token_audience`.
                    // grant_access_token_audience: ["cells-sync"],

                    // The session allows you to set additional data in the access and ID tokens.
                    session: {
                        // Sets session data for the access and refresh token, as well as any future tokens issued by the
                        // refresh grant. Keep in mind that this data will be available to anyone performing OAuth 2.0 Challenge Introspection.
                        // If only your services can perform OAuth 2.0 Challenge Introspection, this is usually fine. But if third parties
                        // can access that endpoint as well, sensitive data from the session might be exposed to them. Use with care!
                        access_token: {
                            name: pydio.user.id
                        },

                        // Sets session data for the OpenID Connect ID token. Keep in mind that the session'id payloads are readable
                        // by anyone that has access to the ID Challenge. Use with care! Any information added here will be mirrored at
                        // the `/userinfo` endpoint.
                        id_token: {
                            name: pydio.user.id
                        }
                    }
                };

                fetch('/oidc/admin/oauth2/auth/requests/consent/accept?' + _queryString2['default'].stringify({ consent_challenge: consentChallenge }), {
                    method: 'PUT',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                }).then(function (response) {
                    return response.json();
                }).then(function (response) {
                    // The response will contain a `redirect_to` key which contains the URL where the user's user agent must be redirected to next.
                    window.location.replace(response.redirect_to);
                });
            });
        };

        _class2.prototype.render = function render() {
            var _this3 = this;

            if (pydio.user) {
                this.authorize();
                return null;
            }
            var error = this.state.error;

            pydio.observe('user_logged', function (u) {
                return u && _this3.authorize();
            });

            return _react2['default'].createElement(
                'div',
                null,
                error && _react2['default'].createElement(ErrorDialog, this.state),
                this.props.children
            );
        };

        return _class2;
    })(_react.PureComponent);
};

exports.OAuthConsentRouter = OAuthConsentRouter;
var OAuthOOBRouter = function OAuthOOBRouter(pydio) {
    return (function (_PureComponent3) {
        _inherits(_class3, _PureComponent3);

        function _class3(props) {
            _classCallCheck(this, _class3);

            _PureComponent3.call(this, props);
            var parsed = _queryString2['default'].parse(location.search);
            this.state = _extends({}, parsed);
        }

        _class3.prototype.render = function render() {
            var code = this.state.code;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(ErrorDialog, _extends({}, this.state, {
                    successText: "You were succesfully authenticated. Please copy and paste the code to your command line terminal",
                    copyText: code
                })),
                this.props.children
            );
        };

        return _class3;
    })(_react.PureComponent);
};

exports.OAuthOOBRouter = OAuthOOBRouter;
var OAuthFallbacksRouter = function OAuthFallbacksRouter(pydio) {
    return (function (_PureComponent4) {
        _inherits(_class4, _PureComponent4);

        function _class4(props) {
            _classCallCheck(this, _class4);

            _PureComponent4.call(this, props);
            var parsed = _queryString2['default'].parse(location.search);
            this.state = _extends({}, parsed);
        }

        _class4.prototype.render = function render() {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(ErrorDialog, this.state),
                this.props.children
            );
        };

        return _class4;
    })(_react.PureComponent);
};
exports.OAuthFallbacksRouter = OAuthFallbacksRouter;
