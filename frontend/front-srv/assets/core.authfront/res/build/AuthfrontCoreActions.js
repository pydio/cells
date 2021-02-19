(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.AuthfrontCoreActions = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _cellsSdk = require('cells-sdk');

var LanguagePicker = function LanguagePicker(props) {
    var items = [];
    var pydio = _pydio2['default'].getInstance();

    pydio.listLanguagesWithCallback(function (key, label, current) {
        return items.push(_react2['default'].createElement(_materialUi.MenuItem, {
            primaryText: label,
            value: key,
            rightIcon: current ? _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-check' }) : null
        }));
    });
    var anchorOrigin = props.anchorOrigin;
    var targetOrigin = props.targetOrigin;

    var iconStyles = {
        style: {
            width: 38,
            height: 38,
            padding: 6,
            borderRadius: '50%'
        },
        hoveredStyle: {
            backgroundColor: 'rgba(255,255,255,.1)'
        },
        iconStyle: {
            fontSize: 20,
            color: 'rgba(255,255,255,.87)'
        }
    };

    return _react2['default'].createElement(
        _materialUi.IconMenu,
        {
            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, _extends({ tooltip: pydio.MessageHash[618], iconClassName: 'mdi mdi-flag-outline' }, iconStyles)),
            onItemTouchTap: function (e, o) {
                pydio.loadI18NMessages(o.props.value);
            },
            desktop: true,
            anchorOrigin: anchorOrigin, targetOrigin: targetOrigin
        },
        items
    );
};

var LoginDialogMixin = {

    getInitialState: function getInitialState() {
        var pydio = _pydio2['default'].getInstance();

        return {
            globalParameters: pydio.Parameters,
            authParameters: pydio.getPluginConfigs('auth'),
            errorId: null,
            displayCaptcha: false
        };
    },

    postLoginData: function postLoginData(restClient) {
        var _this = this;

        var pydio = _pydio2['default'].getInstance();
        var passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        var login = undefined;
        if (passwordOnly) {
            login = this.state.globalParameters.get('PRESET_LOGIN');
        } else {
            login = this.refs.login.getValue();
        }

        restClient.sessionLoginWithCredentials(login, this.refs.password.getValue()).then(function () {
            return _this.dismiss();
        }).then(function () {
            return restClient.getOrUpdateJwt().then(function () {
                return pydio.loadXmlRegistry(null, null, null);
            })['catch'](function () {});
        })['catch'](function (e) {
            if (e && e.response && e.response.body) {
                _this.setState({ errorId: e.response.body.Title });
            } else if (e && e.response && e.response.text) {
                _this.setState({ errorId: e.response.text });
            } else if (e && e.message) {
                _this.setState({ errorId: e.message });
            } else {
                _this.setState({ errorId: 'Login failed!' });
            }
        });
    }
};

var LoginPasswordDialog = (0, _createReactClass2['default'])({

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin, LoginDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '', //pydio.MessageHash[163],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        return { rememberChecked: false };
    },

    submit: function submit() {
        var client = _pydioHttpApi2['default'].getRestClient();
        this.postLoginData(client);
    },

    fireForgotPassword: function fireForgotPassword(e) {
        e.stopPropagation();
        _pydio2['default'].getInstance().getController().fireAction(this.state.authParameters.get("FORGOT_PASSWORD_ACTION"));
    },

    useBlur: function useBlur() {
        return true;
    },

    dialogBodyStyle: function dialogBodyStyle() {
        return { minHeight: 250 };
    },

    getButtons: function getButtons() {
        var _this2 = this;

        var pydio = _pydio2['default'].getInstance();
        var passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        var secureLoginForm = passwordOnly || this.state.authParameters.get('SECURE_LOGIN_FORM');

        var enterButton = _react2['default'].createElement(_materialUi.FlatButton, { id: 'dialog-login-submit', 'default': true, labelStyle: { color: 'white' }, key: 'enter', label: pydio.MessageHash[617], onClick: function () {
                return _this2.submit();
            } });
        var buttons = [];
        if (false && !secureLoginForm) {
            buttons.push(_react2['default'].createElement(
                DarkThemeContainer,
                { key: 'remember', style: { flex: 1, textAlign: 'left', paddingLeft: 16 } },
                _react2['default'].createElement(_materialUi.Checkbox, { label: pydio.MessageHash[261], labelStyle: { fontSize: 13 }, onCheck: function (e, c) {
                        _this2.setState({ rememberChecked: c });
                    } })
            ));
            buttons.push(enterButton);
            return [_react2['default'].createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center' } },
                buttons
            )];
        } else {
            return [enterButton];
        }
    },

    render: function render() {
        var _this3 = this;

        var passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        var secureLoginForm = passwordOnly || this.state.authParameters.get('SECURE_LOGIN_FORM');
        var forgotPasswordLink = this.state.authParameters.get('ENABLE_FORGOT_PASSWORD') && !passwordOnly;
        var pydio = _pydio2['default'].getInstance();

        var errorMessage = undefined;
        if (this.state.errorId) {
            errorMessage = _react2['default'].createElement(
                'div',
                { className: 'ajxp_login_error' },
                this.state.errorId
            );
        }
        var forgotLink = undefined;
        if (forgotPasswordLink) {
            forgotLink = _react2['default'].createElement(
                'div',
                { className: 'forgot-password-link' },
                _react2['default'].createElement(
                    'a',
                    { style: { cursor: 'pointer' }, onClick: this.fireForgotPassword },
                    pydio.MessageHash[479]
                )
            );
        }
        var additionalComponentsTop = undefined,
            additionalComponentsBottom = undefined;
        if (this.props.modifiers) {
            (function () {
                var comps = { top: [], bottom: [] };
                _this3.props.modifiers.map((function (m) {
                    m.renderAdditionalComponents(this.props, this.state, comps);
                }).bind(_this3));
                if (comps.top.length) {
                    additionalComponentsTop = _react2['default'].createElement(
                        'div',
                        null,
                        comps.top
                    );
                }
                if (comps.bottom.length) {
                    additionalComponentsBottom = _react2['default'].createElement(
                        'div',
                        null,
                        comps.bottom
                    );
                }
            })();
        }

        var custom = this.props.pydio.Parameters.get('customWording');
        var logoUrl = custom.icon;
        var loginTitle = pydio.MessageHash[passwordOnly ? 552 : 180];
        var loginLegend = undefined;
        if (custom.iconBinary) {
            logoUrl = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + custom.iconBinary;
        }
        if (!passwordOnly) {
            if (custom.loginTitle) {
                loginTitle = custom.loginTitle;
            }
            if (custom.loginLegend) {
                loginLegend = custom.loginLegend;
            }
        }

        var logoStyle = {
            backgroundSize: 'contain',
            backgroundImage: 'url(' + logoUrl + ')',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: -130,
            left: 0,
            width: 320,
            height: 120
        };

        return _react2['default'].createElement(
            DarkThemeContainer,
            null,
            logoUrl && _react2['default'].createElement('div', { style: logoStyle }),
            _react2['default'].createElement(
                'div',
                { className: 'dialogLegend', style: { fontSize: 22, paddingBottom: 12, lineHeight: '28px' } },
                loginTitle,
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute', bottom: 9, left: 24 } },
                    _react2['default'].createElement(LanguagePicker, { anchorOrigin: { horizontal: 'left', vertical: 'bottom' }, targetOrigin: { horizontal: 'left', vertical: 'bottom' } })
                )
            ),
            loginLegend && _react2['default'].createElement(
                'div',
                null,
                loginLegend
            ),
            errorMessage,
            additionalComponentsTop,
            _react2['default'].createElement(
                'form',
                { autoComplete: secureLoginForm ? "off" : "on" },
                !passwordOnly && _react2['default'].createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    autoComplete: secureLoginForm ? "off" : "on",
                    floatingLabelText: pydio.MessageHash[181],
                    ref: 'login',
                    onKeyDown: this.submitOnEnterKey,
                    fullWidth: true,
                    id: 'application-login'
                }),
                _react2['default'].createElement(_materialUi.TextField, {
                    id: 'application-password',
                    className: 'blurDialogTextField',
                    autoComplete: secureLoginForm ? "off" : "on",
                    type: 'password',
                    floatingLabelText: pydio.MessageHash[182],
                    ref: 'password',
                    onKeyDown: this.submitOnEnterKey,
                    fullWidth: true
                })
            ),
            additionalComponentsBottom,
            forgotLink
        );
    }

});

var DarkThemeContainer = (function (_React$Component) {
    _inherits(DarkThemeContainer, _React$Component);

    function DarkThemeContainer() {
        _classCallCheck(this, DarkThemeContainer);

        _get(Object.getPrototypeOf(DarkThemeContainer.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DarkThemeContainer, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var muiTheme = _props.muiTheme;

            var props = _objectWithoutProperties(_props, ['muiTheme']);

            var baseTheme = _extends({}, _materialUiStyles.darkBaseTheme);
            baseTheme.palette.primary1Color = muiTheme.palette.accent1Color;
            var darkTheme = (0, _materialUiStyles.getMuiTheme)(baseTheme);

            return _react2['default'].createElement(
                _materialUi.MuiThemeProvider,
                { muiTheme: darkTheme },
                _react2['default'].createElement('div', props)
            );
        }
    }]);

    return DarkThemeContainer;
})(_react2['default'].Component);

DarkThemeContainer = (0, _materialUiStyles.muiThemeable)()(DarkThemeContainer);

var MultiAuthSelector = (0, _createReactClass2['default'])({

    getValue: function getValue() {
        return this.state.value;
    },

    getInitialState: function getInitialState() {
        return { value: Object.keys(this.props.authSources).shift() };
    },

    onChange: function onChange(object, key, payload) {
        this.setState({ value: payload });
    },

    render: function render() {
        var menuItems = [];
        for (var key in this.props.authSources) {
            menuItems.push(_react2['default'].createElement(_materialUi.MenuItem, { value: key, primaryText: this.props.authSources[key] }));
        }
        return _react2['default'].createElement(
            _materialUi.SelectField,
            {
                value: this.state.value,
                onChange: this.onChange,
                floatingLabelText: 'Login as...'
            },
            menuItems
        );
    }
});

var MultiAuthModifier = (function (_PydioReactUI$AbstractDialogModifier) {
    _inherits(MultiAuthModifier, _PydioReactUI$AbstractDialogModifier);

    function MultiAuthModifier() {
        _classCallCheck(this, MultiAuthModifier);

        _get(Object.getPrototypeOf(MultiAuthModifier.prototype), 'constructor', this).call(this);
    }

    _createClass(MultiAuthModifier, [{
        key: 'enrichSubmitParameters',
        value: function enrichSubmitParameters(props, state, refs, params) {

            var selectedSource = refs.multi_selector.getValue();
            params['auth_source'] = selectedSource;
            if (props.masterAuthSource && selectedSource === props.masterAuthSource) {
                params['userid'] = selectedSource + props.userIdSeparator + params['userid'];
            }
        }
    }, {
        key: 'renderAdditionalComponents',
        value: function renderAdditionalComponents(props, state, accumulator) {

            if (!props.authSources) {
                console.error('Could not find authSources');
                return;
            }
            accumulator.top.push(_react2['default'].createElement(MultiAuthSelector, _extends({ ref: 'multi_selector' }, props, { parentState: state })));
        }
    }]);

    return MultiAuthModifier;
})(PydioReactUI.AbstractDialogModifier);

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'sessionLogout',
        value: function sessionLogout() {

            var pydio = _pydio2['default'].getInstance();

            if (pydio.Parameters.get("PRELOG_USER")) {
                return;
            }
            var url = pydio.getFrontendUrl();
            var target = url.protocol + '//' + url.host + '/logout';

            _pydioHttpApi2['default'].getRestClient().sessionLogout().then(function () {
                return pydio.loadXmlRegistry(null, null, null);
            })['catch'](function (e) {
                window.location.href = target;
            });
        }
    }, {
        key: 'loginPassword',
        value: function loginPassword(manager) {
            var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            var pydio = _pydio2['default'].getInstance();
            if (pydio.Parameters.get("PRELOG_USER")) {
                return;
            }

            var _ref = args[0] || {};

            var props = _objectWithoutProperties(_ref, []);

            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'LoginPasswordDialog', _extends({}, props, { blur: true }));
        }
    }]);

    return Callbacks;
})();

var ResetPasswordRequire = (0, _createReactClass2['default'])({

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin, PydioReactUI.CancelButtonProviderMixin],

    statics: {
        open: function open() {
            _pydio2['default'].getInstance().UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordRequire', { blur: true });
        }
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: _pydio2['default'].getInstance().MessageHash['gui.user.1'],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    useBlur: function useBlur() {
        return true;
    },

    cancel: function cancel() {
        _pydio2['default'].getInstance().Controller.fireAction('login');
    },

    submit: function submit() {
        var _this4 = this;

        var valueSubmitted = this.state && this.state.valueSubmitted;
        if (valueSubmitted) {
            this.cancel();
        }
        var value = this.refs.input && this.refs.input.getValue();
        if (!value) {
            return;
        }

        var api = new _cellsSdk.TokenServiceApi(_pydioHttpApi2['default'].getRestClient());
        api.resetPasswordToken(value).then(function () {
            _this4.setState({ valueSubmitted: true });
        });
    },

    render: function render() {
        var mess = this.props.pydio.MessageHash;
        var valueSubmitted = this.state && this.state.valueSubmitted;
        return _react2['default'].createElement(
            'div',
            null,
            !valueSubmitted && _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { className: 'dialogLegend' },
                    mess['gui.user.3']
                ),
                _react2['default'].createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    ref: 'input',
                    fullWidth: true,
                    floatingLabelText: mess['gui.user.4']
                })
            ),
            valueSubmitted && _react2['default'].createElement(
                'div',
                null,
                mess['gui.user.5']
            )
        );
    }

});

var ResetPasswordDialog = (0, _createReactClass2['default'])({

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin],

    statics: {
        open: function open() {
            _pydio2['default'].getInstance().UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordDialog', { blur: true });
        }
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: _pydio2['default'].getInstance().MessageHash['gui.user.1'],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        return { valueSubmitted: false, formLoaded: false, passValue: null, userId: null };
    },

    useBlur: function useBlur() {
        return true;
    },

    submit: function submit() {
        var _this5 = this;

        var pydio = this.props.pydio;

        if (this.state.valueSubmitted) {
            this.props.onDismiss();
            var url = pydio.getFrontendUrl();
            window.location.href = url.protocol + '//' + url.host + '/login';
            return;
        }

        var mess = pydio.MessageHash;
        var api = new _cellsSdk.TokenServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _cellsSdk.RestResetPasswordRequest();
        request.UserLogin = this.state.userId;
        request.ResetPasswordToken = pydio.Parameters.get('USER_ACTION_KEY');
        request.NewPassword = this.state.passValue;
        api.resetPassword(request).then(function () {
            _this5.setState({ valueSubmitted: true });
        })['catch'](function (e) {
            alert(mess[240]);
        });
    },

    componentDidMount: function componentDidMount() {
        var _this6 = this;

        Promise.resolve(_pydio2['default'].requireLib('form', true)).then(function () {
            _this6.setState({ formLoaded: true });
        });
    },

    onPassChange: function onPassChange(newValue, oldValue) {
        this.setState({ passValue: newValue });
    },

    onUserIdChange: function onUserIdChange(event, newValue) {
        this.setState({ userId: newValue });
    },

    render: function render() {
        var mess = this.props.pydio.MessageHash;
        var _state = this.state;
        var valueSubmitted = _state.valueSubmitted;
        var formLoaded = _state.formLoaded;
        var passValue = _state.passValue;
        var userId = _state.userId;

        if (!valueSubmitted && formLoaded) {

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { className: 'dialogLegend' },
                    mess['gui.user.8']
                ),
                _react2['default'].createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    value: userId,
                    floatingLabelText: mess['gui.user.4'],
                    onChange: this.onUserIdChange.bind(this)
                }),
                _react2['default'].createElement(PydioForm.ValidPassword, {
                    className: 'blurDialogTextField',
                    onChange: this.onPassChange.bind(this),
                    attributes: { name: 'password', label: mess[198] },
                    value: passValue,
                    dialogField: true
                })
            );
        } else if (valueSubmitted) {

            return _react2['default'].createElement(
                'div',
                null,
                mess['gui.user.6']
            );
        } else {
            return _react2['default'].createElement(PydioReactUI.Loader, null);
        }
    }

});

exports.Callbacks = Callbacks;
exports.LoginPasswordDialog = LoginPasswordDialog;
exports.ResetPasswordRequire = ResetPasswordRequire;
exports.ResetPasswordDialog = ResetPasswordDialog;
exports.MultiAuthModifier = MultiAuthModifier;
exports.LanguagePicker = LanguagePicker;

},{"cells-sdk":"cells-sdk","create-react-class":"create-react-class","material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react"}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ29yZUFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhvYmosIGtleXMpIHsgdmFyIHRhcmdldCA9IHt9OyBmb3IgKHZhciBpIGluIG9iaikgeyBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlOyBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTsgdGFyZ2V0W2ldID0gb2JqW2ldOyB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpbyA9IHJlcXVpcmUoJ3B5ZGlvJyk7XG5cbnZhciBfcHlkaW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW8pO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoXCJweWRpby9odHRwL2FwaVwiKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVSZWFjdENsYXNzKTtcblxudmFyIF9tYXRlcmlhbFVpU3R5bGVzID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWkvc3R5bGVzJyk7XG5cbnZhciBfbWF0ZXJpYWxVaSA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpJyk7XG5cbnZhciBfY2VsbHNTZGsgPSByZXF1aXJlKCdjZWxscy1zZGsnKTtcblxudmFyIExhbmd1YWdlUGlja2VyID0gZnVuY3Rpb24gTGFuZ3VhZ2VQaWNrZXIocHJvcHMpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcblxuICAgIHB5ZGlvLmxpc3RMYW5ndWFnZXNXaXRoQ2FsbGJhY2soZnVuY3Rpb24gKGtleSwgbGFiZWwsIGN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHtcbiAgICAgICAgICAgIHByaW1hcnlUZXh0OiBsYWJlbCxcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICByaWdodEljb246IGN1cnJlbnQgPyBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZWNrJyB9KSA6IG51bGxcbiAgICAgICAgfSkpO1xuICAgIH0pO1xuICAgIHZhciBhbmNob3JPcmlnaW4gPSBwcm9wcy5hbmNob3JPcmlnaW47XG4gICAgdmFyIHRhcmdldE9yaWdpbiA9IHByb3BzLnRhcmdldE9yaWdpbjtcblxuICAgIHZhciBpY29uU3R5bGVzID0ge1xuICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgd2lkdGg6IDM4LFxuICAgICAgICAgICAgaGVpZ2h0OiAzOCxcbiAgICAgICAgICAgIHBhZGRpbmc6IDYsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1MCUnXG4gICAgICAgIH0sXG4gICAgICAgIGhvdmVyZWRTdHlsZToge1xuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwuMSknXG4gICAgICAgIH0sXG4gICAgICAgIGljb25TdHlsZToge1xuICAgICAgICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LC44NyknXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICBfbWF0ZXJpYWxVaS5JY29uTWVudSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWNvbkJ1dHRvbkVsZW1lbnQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIF9leHRlbmRzKHsgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbNjE4XSwgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktZmxhZy1vdXRsaW5lJyB9LCBpY29uU3R5bGVzKSksXG4gICAgICAgICAgICBvbkl0ZW1Ub3VjaFRhcDogZnVuY3Rpb24gKGUsIG8pIHtcbiAgICAgICAgICAgICAgICBweWRpby5sb2FkSTE4Tk1lc3NhZ2VzKG8ucHJvcHMudmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlc2t0b3A6IHRydWUsXG4gICAgICAgICAgICBhbmNob3JPcmlnaW46IGFuY2hvck9yaWdpbiwgdGFyZ2V0T3JpZ2luOiB0YXJnZXRPcmlnaW5cbiAgICAgICAgfSxcbiAgICAgICAgaXRlbXNcbiAgICApO1xufTtcblxudmFyIExvZ2luRGlhbG9nTWl4aW4gPSB7XG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdsb2JhbFBhcmFtZXRlcnM6IHB5ZGlvLlBhcmFtZXRlcnMsXG4gICAgICAgICAgICBhdXRoUGFyYW1ldGVyczogcHlkaW8uZ2V0UGx1Z2luQ29uZmlncygnYXV0aCcpLFxuICAgICAgICAgICAgZXJyb3JJZDogbnVsbCxcbiAgICAgICAgICAgIGRpc3BsYXlDYXB0Y2hhOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBwb3N0TG9naW5EYXRhOiBmdW5jdGlvbiBwb3N0TG9naW5EYXRhKHJlc3RDbGllbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgbG9naW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwYXNzd29yZE9ubHkpIHtcbiAgICAgICAgICAgIGxvZ2luID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUFJFU0VUX0xPR0lOJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dpbiA9IHRoaXMucmVmcy5sb2dpbi5nZXRWYWx1ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdENsaWVudC5zZXNzaW9uTG9naW5XaXRoQ3JlZGVudGlhbHMobG9naW4sIHRoaXMucmVmcy5wYXNzd29yZC5nZXRWYWx1ZSgpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5kaXNtaXNzKCk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3RDbGllbnQuZ2V0T3JVcGRhdGVKd3QoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8ubG9hZFhtbFJlZ2lzdHJ5KG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge30pO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUgJiYgZS5yZXNwb25zZSAmJiBlLnJlc3BvbnNlLmJvZHkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVycm9ySWQ6IGUucmVzcG9uc2UuYm9keS5UaXRsZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSAmJiBlLnJlc3BvbnNlICYmIGUucmVzcG9uc2UudGV4dCkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogZS5yZXNwb25zZS50ZXh0IH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlICYmIGUubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogZS5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVycm9ySWQ6ICdMb2dpbiBmYWlsZWQhJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIExvZ2luUGFzc3dvcmREaWFsb2cgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4sIExvZ2luRGlhbG9nTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsIC8vcHlkaW8uTWVzc2FnZUhhc2hbMTYzXSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyByZW1lbWJlckNoZWNrZWQ6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgICAgIHRoaXMucG9zdExvZ2luRGF0YShjbGllbnQpO1xuICAgIH0sXG5cbiAgICBmaXJlRm9yZ290UGFzc3dvcmQ6IGZ1bmN0aW9uIGZpcmVGb3Jnb3RQYXNzd29yZChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KFwiRk9SR09UX1BBU1NXT1JEX0FDVElPTlwiKSk7XG4gICAgfSxcblxuICAgIHVzZUJsdXI6IGZ1bmN0aW9uIHVzZUJsdXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBkaWFsb2dCb2R5U3R5bGU6IGZ1bmN0aW9uIGRpYWxvZ0JvZHlTdHlsZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgbWluSGVpZ2h0OiAyNTAgfTtcbiAgICB9LFxuXG4gICAgZ2V0QnV0dG9uczogZnVuY3Rpb24gZ2V0QnV0dG9ucygpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCk7XG4gICAgICAgIHZhciBwYXNzd29yZE9ubHkgPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQQVNTV09SRF9BVVRIX09OTFknKTtcbiAgICAgICAgdmFyIHNlY3VyZUxvZ2luRm9ybSA9IHBhc3N3b3JkT25seSB8fCB0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldCgnU0VDVVJFX0xPR0lOX0ZPUk0nKTtcblxuICAgICAgICB2YXIgZW50ZXJCdXR0b24gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGlkOiAnZGlhbG9nLWxvZ2luLXN1Ym1pdCcsICdkZWZhdWx0JzogdHJ1ZSwgbGFiZWxTdHlsZTogeyBjb2xvcjogJ3doaXRlJyB9LCBrZXk6ICdlbnRlcicsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs2MTddLCBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5zdWJtaXQoKTtcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgIGlmIChmYWxzZSAmJiAhc2VjdXJlTG9naW5Gb3JtKSB7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgRGFya1RoZW1lQ29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHsga2V5OiAncmVtZW1iZXInLCBzdHlsZTogeyBmbGV4OiAxLCB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZ0xlZnQ6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5DaGVja2JveCwgeyBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbMjYxXSwgbGFiZWxTdHlsZTogeyBmb250U2l6ZTogMTMgfSwgb25DaGVjazogZnVuY3Rpb24gKGUsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHJlbWVtYmVyQ2hlY2tlZDogYyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goZW50ZXJCdXR0b24pO1xuICAgICAgICAgICAgcmV0dXJuIFtfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtlbnRlckJ1dHRvbl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwYXNzd29yZE9ubHkgPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQQVNTV09SRF9BVVRIX09OTFknKTtcbiAgICAgICAgdmFyIHNlY3VyZUxvZ2luRm9ybSA9IHBhc3N3b3JkT25seSB8fCB0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldCgnU0VDVVJFX0xPR0lOX0ZPUk0nKTtcbiAgICAgICAgdmFyIGZvcmdvdFBhc3N3b3JkTGluayA9IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdFTkFCTEVfRk9SR09UX1BBU1NXT1JEJykgJiYgIXBhc3N3b3JkT25seTtcbiAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3JJZCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdhanhwX2xvZ2luX2Vycm9yJyB9LFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuZXJyb3JJZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9yZ290TGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGZvcmdvdFBhc3N3b3JkTGluaykge1xuICAgICAgICAgICAgZm9yZ290TGluayA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZm9yZ290LXBhc3N3b3JkLWxpbmsnIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdhJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJyB9LCBvbkNsaWNrOiB0aGlzLmZpcmVGb3Jnb3RQYXNzd29yZCB9LFxuICAgICAgICAgICAgICAgICAgICBweWRpby5NZXNzYWdlSGFzaFs0NzldXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYWRkaXRpb25hbENvbXBvbmVudHNUb3AgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c0JvdHRvbSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubW9kaWZpZXJzKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb21wcyA9IHsgdG9wOiBbXSwgYm90dG9tOiBbXSB9O1xuICAgICAgICAgICAgICAgIF90aGlzMy5wcm9wcy5tb2RpZmllcnMubWFwKChmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgICAgICAgICBtLnJlbmRlckFkZGl0aW9uYWxDb21wb25lbnRzKHRoaXMucHJvcHMsIHRoaXMuc3RhdGUsIGNvbXBzKTtcbiAgICAgICAgICAgICAgICB9KS5iaW5kKF90aGlzMykpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wcy50b3AubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzVG9wID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wcy50b3BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBzLmJvdHRvbS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNCb3R0b20gPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLmJvdHRvbVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VzdG9tID0gdGhpcy5wcm9wcy5weWRpby5QYXJhbWV0ZXJzLmdldCgnY3VzdG9tV29yZGluZycpO1xuICAgICAgICB2YXIgbG9nb1VybCA9IGN1c3RvbS5pY29uO1xuICAgICAgICB2YXIgbG9naW5UaXRsZSA9IHB5ZGlvLk1lc3NhZ2VIYXNoW3Bhc3N3b3JkT25seSA/IDU1MiA6IDE4MF07XG4gICAgICAgIHZhciBsb2dpbkxlZ2VuZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGN1c3RvbS5pY29uQmluYXJ5KSB7XG4gICAgICAgICAgICBsb2dvVXJsID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ0VORFBPSU5UX1JFU1RfQVBJJykgKyBcIi9mcm9udGVuZC9iaW5hcmllcy9HTE9CQUwvXCIgKyBjdXN0b20uaWNvbkJpbmFyeTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhc3N3b3JkT25seSkge1xuICAgICAgICAgICAgaWYgKGN1c3RvbS5sb2dpblRpdGxlKSB7XG4gICAgICAgICAgICAgICAgbG9naW5UaXRsZSA9IGN1c3RvbS5sb2dpblRpdGxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN1c3RvbS5sb2dpbkxlZ2VuZCkge1xuICAgICAgICAgICAgICAgIGxvZ2luTGVnZW5kID0gY3VzdG9tLmxvZ2luTGVnZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvZ29TdHlsZSA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRTaXplOiAnY29udGFpbicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIGxvZ29VcmwgKyAnKScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246ICdjZW50ZXInLFxuICAgICAgICAgICAgYmFja2dyb3VuZFJlcGVhdDogJ25vLXJlcGVhdCcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogLTEzMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogMzIwLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBEYXJrVGhlbWVDb250YWluZXIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgbG9nb1VybCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogbG9nb1N0eWxlIH0pLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkaWFsb2dMZWdlbmQnLCBzdHlsZTogeyBmb250U2l6ZTogMjIsIHBhZGRpbmdCb3R0b206IDEyLCBsaW5lSGVpZ2h0OiAnMjhweCcgfSB9LFxuICAgICAgICAgICAgICAgIGxvZ2luVGl0bGUsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBib3R0b206IDksIGxlZnQ6IDI0IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTGFuZ3VhZ2VQaWNrZXIsIHsgYW5jaG9yT3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0sIHRhcmdldE9yaWdpbjogeyBob3Jpem9udGFsOiAnbGVmdCcsIHZlcnRpY2FsOiAnYm90dG9tJyB9IH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGxvZ2luTGVnZW5kICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbG9naW5MZWdlbmRcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIiB9LFxuICAgICAgICAgICAgICAgICFwYXNzd29yZE9ubHkgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6IHNlY3VyZUxvZ2luRm9ybSA/IFwib2ZmXCIgOiBcIm9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBweWRpby5NZXNzYWdlSGFzaFsxODFdLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdsb2dpbicsXG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5zdWJtaXRPbkVudGVyS2V5LFxuICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGlkOiAnYXBwbGljYXRpb24tbG9naW4nXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnYXBwbGljYXRpb24tcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBzZWN1cmVMb2dpbkZvcm0gPyBcIm9mZlwiIDogXCJvblwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbMTgyXSxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuc3VibWl0T25FbnRlcktleSxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c0JvdHRvbSxcbiAgICAgICAgICAgIGZvcmdvdExpbmtcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgRGFya1RoZW1lQ29udGFpbmVyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKERhcmtUaGVtZUNvbnRhaW5lciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEYXJrVGhlbWVDb250YWluZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEYXJrVGhlbWVDb250YWluZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKERhcmtUaGVtZUNvbnRhaW5lci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEYXJrVGhlbWVDb250YWluZXIsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wcy5tdWlUaGVtZTtcblxuICAgICAgICAgICAgdmFyIHByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9wcm9wcywgWydtdWlUaGVtZSddKTtcblxuICAgICAgICAgICAgdmFyIGJhc2VUaGVtZSA9IF9leHRlbmRzKHt9LCBfbWF0ZXJpYWxVaVN0eWxlcy5kYXJrQmFzZVRoZW1lKTtcbiAgICAgICAgICAgIGJhc2VUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLmFjY2VudDFDb2xvcjtcbiAgICAgICAgICAgIHZhciBkYXJrVGhlbWUgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMuZ2V0TXVpVGhlbWUpKGJhc2VUaGVtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NdWlUaGVtZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHsgbXVpVGhlbWU6IGRhcmtUaGVtZSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCBwcm9wcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRGFya1RoZW1lQ29udGFpbmVyO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbkRhcmtUaGVtZUNvbnRhaW5lciA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoRGFya1RoZW1lQ29udGFpbmVyKTtcblxudmFyIE11bHRpQXV0aFNlbGVjdG9yID0gKDAsIF9jcmVhdGVSZWFjdENsYXNzMlsnZGVmYXVsdCddKSh7XG5cbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24gZ2V0VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbHVlO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuYXV0aFNvdXJjZXMpLnNoaWZ0KCkgfTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIG9uQ2hhbmdlKG9iamVjdCwga2V5LCBwYXlsb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogcGF5bG9hZCB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZW51SXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMucHJvcHMuYXV0aFNvdXJjZXMpIHtcbiAgICAgICAgICAgIG1lbnVJdGVtcy5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBrZXksIHByaW1hcnlUZXh0OiB0aGlzLnByb3BzLmF1dGhTb3VyY2VzW2tleV0gfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9tYXRlcmlhbFVpLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiAnTG9naW4gYXMuLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBNdWx0aUF1dGhNb2RpZmllciA9IChmdW5jdGlvbiAoX1B5ZGlvUmVhY3RVSSRBYnN0cmFjdERpYWxvZ01vZGlmaWVyKSB7XG4gICAgX2luaGVyaXRzKE11bHRpQXV0aE1vZGlmaWVyLCBfUHlkaW9SZWFjdFVJJEFic3RyYWN0RGlhbG9nTW9kaWZpZXIpO1xuXG4gICAgZnVuY3Rpb24gTXVsdGlBdXRoTW9kaWZpZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNdWx0aUF1dGhNb2RpZmllcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTXVsdGlBdXRoTW9kaWZpZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTXVsdGlBdXRoTW9kaWZpZXIsIFt7XG4gICAgICAgIGtleTogJ2VucmljaFN1Ym1pdFBhcmFtZXRlcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW5yaWNoU3VibWl0UGFyYW1ldGVycyhwcm9wcywgc3RhdGUsIHJlZnMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRTb3VyY2UgPSByZWZzLm11bHRpX3NlbGVjdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBwYXJhbXNbJ2F1dGhfc291cmNlJ10gPSBzZWxlY3RlZFNvdXJjZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5tYXN0ZXJBdXRoU291cmNlICYmIHNlbGVjdGVkU291cmNlID09PSBwcm9wcy5tYXN0ZXJBdXRoU291cmNlKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zWyd1c2VyaWQnXSA9IHNlbGVjdGVkU291cmNlICsgcHJvcHMudXNlcklkU2VwYXJhdG9yICsgcGFyYW1zWyd1c2VyaWQnXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMocHJvcHMsIHN0YXRlLCBhY2N1bXVsYXRvcikge1xuXG4gICAgICAgICAgICBpZiAoIXByb3BzLmF1dGhTb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZpbmQgYXV0aFNvdXJjZXMnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY2N1bXVsYXRvci50b3AucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNdWx0aUF1dGhTZWxlY3RvciwgX2V4dGVuZHMoeyByZWY6ICdtdWx0aV9zZWxlY3RvcicgfSwgcHJvcHMsIHsgcGFyZW50U3RhdGU6IHN0YXRlIH0pKSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTXVsdGlBdXRoTW9kaWZpZXI7XG59KShQeWRpb1JlYWN0VUkuQWJzdHJhY3REaWFsb2dNb2RpZmllcik7XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnc2Vzc2lvbkxvZ291dCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXNzaW9uTG9nb3V0KCkge1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICAgICAgaWYgKHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KFwiUFJFTE9HX1VTRVJcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdXJsID0gcHlkaW8uZ2V0RnJvbnRlbmRVcmwoKTtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSB1cmwucHJvdG9jb2wgKyAnLy8nICsgdXJsLmhvc3QgKyAnL2xvZ291dCc7XG5cbiAgICAgICAgICAgIF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpLnNlc3Npb25Mb2dvdXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8ubG9hZFhtbFJlZ2lzdHJ5KG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRhcmdldDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2dpblBhc3N3b3JkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZ2luUGFzc3dvcmQobWFuYWdlcikge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAocHlkaW8uUGFyYW1ldGVycy5nZXQoXCJQUkVMT0dfVVNFUlwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIF9yZWYgPSBhcmdzWzBdIHx8IHt9O1xuXG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3JlZiwgW10pO1xuXG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnQXV0aGZyb250Q29yZUFjdGlvbnMnLCAnTG9naW5QYXNzd29yZERpYWxvZycsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBibHVyOiB0cnVlIH0pKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDYWxsYmFja3M7XG59KSgpO1xuXG52YXIgUmVzZXRQYXNzd29yZFJlcXVpcmUgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdSZXNldFBhc3N3b3JkUmVxdWlyZScsIHsgYmx1cjogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsnZ3VpLnVzZXIuMSddLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbSdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGNhbmNlbDogZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5Db250cm9sbGVyLmZpcmVBY3Rpb24oJ2xvZ2luJyk7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICB2YXIgdmFsdWVTdWJtaXR0ZWQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUudmFsdWVTdWJtaXR0ZWQ7XG4gICAgICAgIGlmICh2YWx1ZVN1Ym1pdHRlZCkge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnJlZnMuaW5wdXQgJiYgdGhpcy5yZWZzLmlucHV0LmdldFZhbHVlKCk7XG4gICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRva2VuU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIGFwaS5yZXNldFBhc3N3b3JkVG9rZW4odmFsdWUpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM0LnNldFN0YXRlKHsgdmFsdWVTdWJtaXR0ZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIG1lc3MgPSB0aGlzLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgdmFsdWVTdWJtaXR0ZWQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUudmFsdWVTdWJtaXR0ZWQ7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICF2YWx1ZVN1Ym1pdHRlZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkaWFsb2dMZWdlbmQnIH0sXG4gICAgICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjMnXVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdmFsdWVTdWJtaXR0ZWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBtZXNzWydndWkudXNlci41J11cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgUmVzZXRQYXNzd29yZERpYWxvZyA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnQXV0aGZyb250Q29yZUFjdGlvbnMnLCAnUmVzZXRQYXNzd29yZERpYWxvZycsIHsgYmx1cjogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKS5NZXNzYWdlSGFzaFsnZ3VpLnVzZXIuMSddLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbSdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlU3VibWl0dGVkOiBmYWxzZSwgZm9ybUxvYWRlZDogZmFsc2UsIHBhc3NWYWx1ZTogbnVsbCwgdXNlcklkOiBudWxsIH07XG4gICAgfSxcblxuICAgIHVzZUJsdXI6IGZ1bmN0aW9uIHVzZUJsdXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgIHZhciB1cmwgPSBweWRpby5nZXRGcm9udGVuZFVybCgpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmwucHJvdG9jb2wgKyAnLy8nICsgdXJsLmhvc3QgKyAnL2xvZ2luJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtZXNzID0gcHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBhcGkgPSBuZXcgX2NlbGxzU2RrLlRva2VuU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9jZWxsc1Nkay5SZXN0UmVzZXRQYXNzd29yZFJlcXVlc3QoKTtcbiAgICAgICAgcmVxdWVzdC5Vc2VyTG9naW4gPSB0aGlzLnN0YXRlLnVzZXJJZDtcbiAgICAgICAgcmVxdWVzdC5SZXNldFBhc3N3b3JkVG9rZW4gPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnVVNFUl9BQ1RJT05fS0VZJyk7XG4gICAgICAgIHJlcXVlc3QuTmV3UGFzc3dvcmQgPSB0aGlzLnN0YXRlLnBhc3NWYWx1ZTtcbiAgICAgICAgYXBpLnJlc2V0UGFzc3dvcmQocmVxdWVzdCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczUuc2V0U3RhdGUoeyB2YWx1ZVN1Ym1pdHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSlbJ2NhdGNoJ10oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGFsZXJ0KG1lc3NbMjQwXSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICAgIFByb21pc2UucmVzb2x2ZShfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignZm9ybScsIHRydWUpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNi5zZXRTdGF0ZSh7IGZvcm1Mb2FkZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblBhc3NDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFzc0NoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhc3NWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgfSxcblxuICAgIG9uVXNlcklkQ2hhbmdlOiBmdW5jdGlvbiBvblVzZXJJZENoYW5nZShldmVudCwgbmV3VmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJJZDogbmV3VmFsdWUgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgdmFsdWVTdWJtaXR0ZWQgPSBfc3RhdGUudmFsdWVTdWJtaXR0ZWQ7XG4gICAgICAgIHZhciBmb3JtTG9hZGVkID0gX3N0YXRlLmZvcm1Mb2FkZWQ7XG4gICAgICAgIHZhciBwYXNzVmFsdWUgPSBfc3RhdGUucGFzc1ZhbHVlO1xuICAgICAgICB2YXIgdXNlcklkID0gX3N0YXRlLnVzZXJJZDtcblxuICAgICAgICBpZiAoIXZhbHVlU3VibWl0dGVkICYmIGZvcm1Mb2FkZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuOCddXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzWydndWkudXNlci40J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uVXNlcklkQ2hhbmdlLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb0Zvcm0uVmFsaWRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25QYXNzQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHsgbmFtZTogJ3Bhc3N3b3JkJywgbGFiZWw6IG1lc3NbMTk4XSB9LFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcGFzc1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBkaWFsb2dGaWVsZDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjYnXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb1JlYWN0VUkuTG9hZGVyLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5cbmV4cG9ydHMuQ2FsbGJhY2tzID0gQ2FsbGJhY2tzO1xuZXhwb3J0cy5Mb2dpblBhc3N3b3JkRGlhbG9nID0gTG9naW5QYXNzd29yZERpYWxvZztcbmV4cG9ydHMuUmVzZXRQYXNzd29yZFJlcXVpcmUgPSBSZXNldFBhc3N3b3JkUmVxdWlyZTtcbmV4cG9ydHMuUmVzZXRQYXNzd29yZERpYWxvZyA9IFJlc2V0UGFzc3dvcmREaWFsb2c7XG5leHBvcnRzLk11bHRpQXV0aE1vZGlmaWVyID0gTXVsdGlBdXRoTW9kaWZpZXI7XG5leHBvcnRzLkxhbmd1YWdlUGlja2VyID0gTGFuZ3VhZ2VQaWNrZXI7XG4iXX0=
