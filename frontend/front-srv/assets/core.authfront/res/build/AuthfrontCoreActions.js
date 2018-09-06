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

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require("pydio/http/rest-api");

var pydio = window.pydio;

var LoginDialogMixin = {

    getInitialState: function getInitialState() {
        return {
            globalParameters: pydio.Parameters,
            authParameters: pydio.getPluginConfigs('auth'),
            errorId: null,
            displayCaptcha: false
        };
    },

    postLoginData: function postLoginData(restClient) {
        var _this = this;

        var passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        var login = undefined;
        if (passwordOnly) {
            login = this.state.globalParameters.get('PRESET_LOGIN');
        } else {
            login = this.refs.login.getValue();
        }
        restClient.jwtFromCredentials(login, this.refs.password.getValue()).then(function (r) {
            if (r.data && r.data.Trigger) {
                return;
            }
            _this.dismiss();
        })['catch'](function (e) {
            if (e.response && e.response.text) {
                _this.setState({ errorId: e.response.text });
            } else if (e.message) {
                _this.setState({ errorId: e.message });
            } else {
                _this.setState({ errorId: 'Login failed!' });
            }
        });
    }
};

var LoginPasswordDialog = React.createClass({
    displayName: 'LoginPasswordDialog',

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
        pydio.getController().fireAction(this.state.authParameters.get("FORGOT_PASSWORD_ACTION"));
    },

    useBlur: function useBlur() {
        return true;
    },

    getButtons: function getButtons() {
        var _this2 = this;

        var passwordOnly = this.state.globalParameters.get('PASSWORD_AUTH_ONLY');
        var secureLoginForm = passwordOnly || this.state.authParameters.get('SECURE_LOGIN_FORM');

        var enterButton = React.createElement(_materialUi.FlatButton, { id: 'dialog-login-submit', 'default': true, labelStyle: { color: 'white' }, key: 'enter', label: pydio.MessageHash[617], onTouchTap: function () {
                return _this2.submit();
            } });
        var buttons = [];
        if (false && !secureLoginForm) {
            buttons.push(React.createElement(
                DarkThemeContainer,
                { key: 'remember', style: { flex: 1, textAlign: 'left', paddingLeft: 16 } },
                React.createElement(_materialUi.Checkbox, { label: pydio.MessageHash[261], labelStyle: { fontSize: 13 }, onCheck: function (e, c) {
                        _this2.setState({ rememberChecked: c });
                    } })
            ));
            buttons.push(enterButton);
            return [React.createElement(
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

        var errorMessage = undefined;
        if (this.state.errorId) {
            errorMessage = React.createElement(
                'div',
                { className: 'ajxp_login_error' },
                this.state.errorId
            );
        }
        var forgotLink = undefined;
        if (forgotPasswordLink) {
            forgotLink = React.createElement(
                'div',
                { className: 'forgot-password-link' },
                React.createElement(
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
                    additionalComponentsTop = React.createElement(
                        'div',
                        null,
                        comps.top
                    );
                }
                if (comps.bottom.length) {
                    additionalComponentsBottom = React.createElement(
                        'div',
                        null,
                        comps.bottom
                    );
                }
            })();
        }

        var custom = this.props.pydio.Parameters.get('customWording');
        var logoUrl = custom.icon;
        if (custom.icon_binary_url) {
            logoUrl = this.props.pydio.Parameters.get('ajxpServerAccess') + '&' + custom.icon_binary_url;
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

        var languages = [];
        pydio.listLanguagesWithCallback(function (key, label, current) {
            languages.push(React.createElement(_materialUi.MenuItem, { primaryText: label, value: key, rightIcon: current ? React.createElement(_materialUi.FontIcon, { className: 'mdi mdi-check' }) : null }));
        });
        var languageMenu = React.createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: React.createElement(_materialUi.IconButton, { tooltip: pydio.MessageHash[618], iconClassName: 'mdi mdi-flag-outline-variant', iconStyle: { fontSize: 20, color: 'rgba(255,255,255,.67)' } }),
                onItemTouchTap: function (e, o) {
                    pydio.loadI18NMessages(o.props.value);
                },
                desktop: true
            },
            languages
        );

        return React.createElement(
            DarkThemeContainer,
            null,
            logoUrl && React.createElement('div', { style: logoStyle }),
            React.createElement(
                'div',
                { className: 'dialogLegend', style: { fontSize: 22, paddingBottom: 12, lineHeight: '28px' } },
                pydio.MessageHash[passwordOnly ? 552 : 180],
                languageMenu
            ),
            errorMessage,
            additionalComponentsTop,
            React.createElement(
                'form',
                { autoComplete: secureLoginForm ? "off" : "on" },
                !passwordOnly && React.createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    autoComplete: secureLoginForm ? "off" : "on",
                    floatingLabelText: pydio.MessageHash[181],
                    ref: 'login',
                    onKeyDown: this.submitOnEnterKey,
                    fullWidth: true,
                    id: 'application-login'
                }),
                React.createElement(_materialUi.TextField, {
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

            return React.createElement(
                _materialUi.MuiThemeProvider,
                { muiTheme: darkTheme },
                React.createElement('div', props)
            );
        }
    }]);

    return DarkThemeContainer;
})(React.Component);

DarkThemeContainer = (0, _materialUiStyles.muiThemeable)()(DarkThemeContainer);

var MultiAuthSelector = React.createClass({
    displayName: 'MultiAuthSelector',

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
            menuItems.push(React.createElement(_materialUi.MenuItem, { value: key, primaryText: this.props.authSources[key] }));
        }
        return React.createElement(
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
            accumulator.top.push(React.createElement(MultiAuthSelector, _extends({ ref: 'multi_selector' }, props, { parentState: state })));
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

            _pydioHttpApi2['default'].getRestClient().sessionLogout();
        }
    }, {
        key: 'loginPassword',
        value: function loginPassword() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'LoginPasswordDialog', _extends({}, props, { blur: true }));
        }
    }]);

    return Callbacks;
})();

var ResetPasswordRequire = React.createClass({
    displayName: 'ResetPasswordRequire',

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin, PydioReactUI.CancelButtonProviderMixin],

    statics: {
        open: function open() {
            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordRequire', { blur: true });
        }
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash['gui.user.1'],
            dialogIsModal: true,
            dialogSize: 'sm'
        };
    },

    useBlur: function useBlur() {
        return true;
    },

    cancel: function cancel() {
        pydio.Controller.fireAction('login');
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

        var api = new _pydioHttpRestApi.TokenServiceApi(_pydioHttpApi2['default'].getRestClient());
        api.resetPasswordToken(value).then(function () {
            _this4.setState({ valueSubmitted: true });
        });
    },

    render: function render() {
        var mess = this.props.pydio.MessageHash;
        var valueSubmitted = this.state && this.state.valueSubmitted;
        return React.createElement(
            'div',
            null,
            !valueSubmitted && React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'dialogLegend' },
                    mess['gui.user.3']
                ),
                React.createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    ref: 'input',
                    fullWidth: true,
                    floatingLabelText: mess['gui.user.4']
                })
            ),
            valueSubmitted && React.createElement(
                'div',
                null,
                mess['gui.user.5']
            )
        );
    }

});

var ResetPasswordDialog = React.createClass({
    displayName: 'ResetPasswordDialog',

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin],

    statics: {
        open: function open() {
            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'ResetPasswordDialog', { blur: true });
        }
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash['gui.user.1'],
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
            window.location.href = pydio.Parameters.get('FRONTEND_URL') + '/login';
            return;
        }

        var mess = pydio.MessageHash;
        var api = new _pydioHttpRestApi.TokenServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _pydioHttpRestApi.RestResetPasswordRequest();
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

        Promise.resolve(require('pydio').requireLib('form', true)).then(function () {
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

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'dialogLegend' },
                    mess['gui.user.8']
                ),
                React.createElement(_materialUi.TextField, {
                    className: 'blurDialogTextField',
                    value: userId,
                    floatingLabelText: mess['gui.user.4'],
                    onChange: this.onUserIdChange.bind(this)
                }),
                React.createElement(PydioForm.ValidPassword, {
                    className: 'blurDialogTextField',
                    onChange: this.onPassChange.bind(this),
                    attributes: { name: 'password', label: mess[198] },
                    value: passValue
                })
            );
        } else if (valueSubmitted) {

            return React.createElement(
                'div',
                null,
                mess['gui.user.6']
            );
        } else {
            return React.createElement(PydioReactUI.Loader, null);
        }
    }

});

exports.Callbacks = Callbacks;
exports.LoginPasswordDialog = LoginPasswordDialog;
exports.ResetPasswordRequire = ResetPasswordRequire;
exports.ResetPasswordDialog = ResetPasswordDialog;
exports.MultiAuthModifier = MultiAuthModifier;

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ29yZUFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhvYmosIGtleXMpIHsgdmFyIHRhcmdldCA9IHt9OyBmb3IgKHZhciBpIGluIG9iaikgeyBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlOyBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTsgdGFyZ2V0W2ldID0gb2JqW2ldOyB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfbWF0ZXJpYWxVaVN0eWxlcyA9IHJlcXVpcmUoJ21hdGVyaWFsLXVpL3N0eWxlcycpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaSA9IHJlcXVpcmUoXCJweWRpby9odHRwL2FwaVwiKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZShcInB5ZGlvL2h0dHAvcmVzdC1hcGlcIik7XG5cbnZhciBweWRpbyA9IHdpbmRvdy5weWRpbztcblxudmFyIExvZ2luRGlhbG9nTWl4aW4gPSB7XG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdsb2JhbFBhcmFtZXRlcnM6IHB5ZGlvLlBhcmFtZXRlcnMsXG4gICAgICAgICAgICBhdXRoUGFyYW1ldGVyczogcHlkaW8uZ2V0UGx1Z2luQ29uZmlncygnYXV0aCcpLFxuICAgICAgICAgICAgZXJyb3JJZDogbnVsbCxcbiAgICAgICAgICAgIGRpc3BsYXlDYXB0Y2hhOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBwb3N0TG9naW5EYXRhOiBmdW5jdGlvbiBwb3N0TG9naW5EYXRhKHJlc3RDbGllbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgcGFzc3dvcmRPbmx5ID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUEFTU1dPUkRfQVVUSF9PTkxZJyk7XG4gICAgICAgIHZhciBsb2dpbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHBhc3N3b3JkT25seSkge1xuICAgICAgICAgICAgbG9naW4gPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQUkVTRVRfTE9HSU4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2luID0gdGhpcy5yZWZzLmxvZ2luLmdldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdENsaWVudC5qd3RGcm9tQ3JlZGVudGlhbHMobG9naW4sIHRoaXMucmVmcy5wYXNzd29yZC5nZXRWYWx1ZSgpKS50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBpZiAoci5kYXRhICYmIHIuZGF0YS5UcmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMuZGlzbWlzcygpO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUucmVzcG9uc2UgJiYgZS5yZXNwb25zZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcklkOiBlLnJlc3BvbnNlLnRleHQgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogZS5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVycm9ySWQ6ICdMb2dpbiBmYWlsZWQhJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIExvZ2luUGFzc3dvcmREaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdMb2dpblBhc3N3b3JkRGlhbG9nJyxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4sIExvZ2luRGlhbG9nTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsIC8vcHlkaW8uTWVzc2FnZUhhc2hbMTYzXSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyByZW1lbWJlckNoZWNrZWQ6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgICAgIHRoaXMucG9zdExvZ2luRGF0YShjbGllbnQpO1xuICAgIH0sXG5cbiAgICBmaXJlRm9yZ290UGFzc3dvcmQ6IGZ1bmN0aW9uIGZpcmVGb3Jnb3RQYXNzd29yZChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KFwiRk9SR09UX1BBU1NXT1JEX0FDVElPTlwiKSk7XG4gICAgfSxcblxuICAgIHVzZUJsdXI6IGZ1bmN0aW9uIHVzZUJsdXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgcGFzc3dvcmRPbmx5ID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUEFTU1dPUkRfQVVUSF9PTkxZJyk7XG4gICAgICAgIHZhciBzZWN1cmVMb2dpbkZvcm0gPSBwYXNzd29yZE9ubHkgfHwgdGhpcy5zdGF0ZS5hdXRoUGFyYW1ldGVycy5nZXQoJ1NFQ1VSRV9MT0dJTl9GT1JNJyk7XG5cbiAgICAgICAgdmFyIGVudGVyQnV0dG9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGlkOiAnZGlhbG9nLWxvZ2luLXN1Ym1pdCcsICdkZWZhdWx0JzogdHJ1ZSwgbGFiZWxTdHlsZTogeyBjb2xvcjogJ3doaXRlJyB9LCBrZXk6ICdlbnRlcicsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs2MTddLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5zdWJtaXQoKTtcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgIGlmIChmYWxzZSAmJiAhc2VjdXJlTG9naW5Gb3JtKSB7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBEYXJrVGhlbWVDb250YWluZXIsXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdyZW1lbWJlcicsIHN0eWxlOiB7IGZsZXg6IDEsIHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nTGVmdDogMTYgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzI2MV0sIGxhYmVsU3R5bGU6IHsgZm9udFNpemU6IDEzIH0sIG9uQ2hlY2s6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyByZW1lbWJlckNoZWNrZWQ6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGVudGVyQnV0dG9uKTtcbiAgICAgICAgICAgIHJldHVybiBbUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtlbnRlckJ1dHRvbl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwYXNzd29yZE9ubHkgPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQQVNTV09SRF9BVVRIX09OTFknKTtcbiAgICAgICAgdmFyIHNlY3VyZUxvZ2luRm9ybSA9IHBhc3N3b3JkT25seSB8fCB0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldCgnU0VDVVJFX0xPR0lOX0ZPUk0nKTtcbiAgICAgICAgdmFyIGZvcmdvdFBhc3N3b3JkTGluayA9IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdFTkFCTEVfRk9SR09UX1BBU1NXT1JEJykgJiYgIXBhc3N3b3JkT25seTtcblxuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcklkKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYWp4cF9sb2dpbl9lcnJvcicgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmVycm9ySWRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvcmdvdExpbmsgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChmb3Jnb3RQYXNzd29yZExpbmspIHtcbiAgICAgICAgICAgIGZvcmdvdExpbmsgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZm9yZ290LXBhc3N3b3JkLWxpbmsnIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IHRoaXMuZmlyZUZvcmdvdFBhc3N3b3JkIH0sXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWzQ3OV1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBzID0geyB0b3A6IFtdLCBib3R0b206IFtdIH07XG4gICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm1vZGlmaWVycy5tYXAoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHModGhpcy5wcm9wcywgdGhpcy5zdGF0ZSwgY29tcHMpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBzLnRvcC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNUb3AgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMudG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wcy5ib3R0b20ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLmJvdHRvbVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VzdG9tID0gdGhpcy5wcm9wcy5weWRpby5QYXJhbWV0ZXJzLmdldCgnY3VzdG9tV29yZGluZycpO1xuICAgICAgICB2YXIgbG9nb1VybCA9IGN1c3RvbS5pY29uO1xuICAgICAgICBpZiAoY3VzdG9tLmljb25fYmluYXJ5X3VybCkge1xuICAgICAgICAgICAgbG9nb1VybCA9IHRoaXMucHJvcHMucHlkaW8uUGFyYW1ldGVycy5nZXQoJ2FqeHBTZXJ2ZXJBY2Nlc3MnKSArICcmJyArIGN1c3RvbS5pY29uX2JpbmFyeV91cmw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nb1N0eWxlID0ge1xuICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb250YWluJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgbG9nb1VybCArICcpJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogJ2NlbnRlcicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0OiAnbm8tcmVwZWF0JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOiAtMTMwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHdpZHRoOiAzMjAsXG4gICAgICAgICAgICBoZWlnaHQ6IDEyMFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsYW5ndWFnZXMgPSBbXTtcbiAgICAgICAgcHlkaW8ubGlzdExhbmd1YWdlc1dpdGhDYWxsYmFjayhmdW5jdGlvbiAoa2V5LCBsYWJlbCwgY3VycmVudCkge1xuICAgICAgICAgICAgbGFuZ3VhZ2VzLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyBwcmltYXJ5VGV4dDogbGFiZWwsIHZhbHVlOiBrZXksIHJpZ2h0SWNvbjogY3VycmVudCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiAnbWRpIG1kaS1jaGVjaycgfSkgOiBudWxsIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBsYW5ndWFnZU1lbnUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuSWNvbk1lbnUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWNvbkJ1dHRvbkVsZW1lbnQ6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFs2MThdLCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1mbGFnLW91dGxpbmUtdmFyaWFudCcsIGljb25TdHlsZTogeyBmb250U2l6ZTogMjAsIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwuNjcpJyB9IH0pLFxuICAgICAgICAgICAgICAgIG9uSXRlbVRvdWNoVGFwOiBmdW5jdGlvbiAoZSwgbykge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5sb2FkSTE4Tk1lc3NhZ2VzKG8ucHJvcHMudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGVza3RvcDogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxhbmd1YWdlc1xuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgRGFya1RoZW1lQ29udGFpbmVyLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgIGxvZ29VcmwgJiYgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogbG9nb1N0eWxlIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcsIHN0eWxlOiB7IGZvbnRTaXplOiAyMiwgcGFkZGluZ0JvdHRvbTogMTIsIGxpbmVIZWlnaHQ6ICcyOHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbcGFzc3dvcmRPbmx5ID8gNTUyIDogMTgwXSxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZU1lbnVcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiBzZWN1cmVMb2dpbkZvcm0gPyBcIm9mZlwiIDogXCJvblwiIH0sXG4gICAgICAgICAgICAgICAgIXBhc3N3b3JkT25seSAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBzZWN1cmVMb2dpbkZvcm0gPyBcIm9mZlwiIDogXCJvblwiLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbMTgxXSxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAnbG9naW4nLFxuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuc3VibWl0T25FbnRlcktleSxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpZDogJ2FwcGxpY2F0aW9uLWxvZ2luJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnYXBwbGljYXRpb24tcGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBzZWN1cmVMb2dpbkZvcm0gPyBcIm9mZlwiIDogXCJvblwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogcHlkaW8uTWVzc2FnZUhhc2hbMTgyXSxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgICBvbktleURvd246IHRoaXMuc3VibWl0T25FbnRlcktleSxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c0JvdHRvbSxcbiAgICAgICAgICAgIGZvcmdvdExpbmtcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgRGFya1RoZW1lQ29udGFpbmVyID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gICAgX2luaGVyaXRzKERhcmtUaGVtZUNvbnRhaW5lciwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgICBmdW5jdGlvbiBEYXJrVGhlbWVDb250YWluZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEYXJrVGhlbWVDb250YWluZXIpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKERhcmtUaGVtZUNvbnRhaW5lci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhEYXJrVGhlbWVDb250YWluZXIsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBtdWlUaGVtZSA9IF9wcm9wcy5tdWlUaGVtZTtcblxuICAgICAgICAgICAgdmFyIHByb3BzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9wcm9wcywgWydtdWlUaGVtZSddKTtcblxuICAgICAgICAgICAgdmFyIGJhc2VUaGVtZSA9IF9leHRlbmRzKHt9LCBfbWF0ZXJpYWxVaVN0eWxlcy5kYXJrQmFzZVRoZW1lKTtcbiAgICAgICAgICAgIGJhc2VUaGVtZS5wYWxldHRlLnByaW1hcnkxQ29sb3IgPSBtdWlUaGVtZS5wYWxldHRlLmFjY2VudDFDb2xvcjtcbiAgICAgICAgICAgIHZhciBkYXJrVGhlbWUgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMuZ2V0TXVpVGhlbWUpKGJhc2VUaGVtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk11aVRoZW1lUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgeyBtdWlUaGVtZTogZGFya1RoZW1lIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgcHJvcHMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERhcmtUaGVtZUNvbnRhaW5lcjtcbn0pKFJlYWN0LkNvbXBvbmVudCk7XG5cbkRhcmtUaGVtZUNvbnRhaW5lciA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5tdWlUaGVtZWFibGUpKCkoRGFya1RoZW1lQ29udGFpbmVyKTtcblxudmFyIE11bHRpQXV0aFNlbGVjdG9yID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTXVsdGlBdXRoU2VsZWN0b3InLFxuXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uIGdldFZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlOiBPYmplY3Qua2V5cyh0aGlzLnByb3BzLmF1dGhTb3VyY2VzKS5zaGlmdCgpIH07XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZShvYmplY3QsIGtleSwgcGF5bG9hZCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHBheWxvYWQgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbWVudUl0ZW1zID0gW107XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLnByb3BzLmF1dGhTb3VyY2VzKSB7XG4gICAgICAgICAgICBtZW51SXRlbXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHZhbHVlOiBrZXksIHByaW1hcnlUZXh0OiB0aGlzLnByb3BzLmF1dGhTb3VyY2VzW2tleV0gfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6ICdMb2dpbiBhcy4uLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE11bHRpQXV0aE1vZGlmaWVyID0gKGZ1bmN0aW9uIChfUHlkaW9SZWFjdFVJJEFic3RyYWN0RGlhbG9nTW9kaWZpZXIpIHtcbiAgICBfaW5oZXJpdHMoTXVsdGlBdXRoTW9kaWZpZXIsIF9QeWRpb1JlYWN0VUkkQWJzdHJhY3REaWFsb2dNb2RpZmllcik7XG5cbiAgICBmdW5jdGlvbiBNdWx0aUF1dGhNb2RpZmllcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE11bHRpQXV0aE1vZGlmaWVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihNdWx0aUF1dGhNb2RpZmllci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNdWx0aUF1dGhNb2RpZmllciwgW3tcbiAgICAgICAga2V5OiAnZW5yaWNoU3VibWl0UGFyYW1ldGVycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbnJpY2hTdWJtaXRQYXJhbWV0ZXJzKHByb3BzLCBzdGF0ZSwgcmVmcywgcGFyYW1zKSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RlZFNvdXJjZSA9IHJlZnMubXVsdGlfc2VsZWN0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHBhcmFtc1snYXV0aF9zb3VyY2UnXSA9IHNlbGVjdGVkU291cmNlO1xuICAgICAgICAgICAgaWYgKHByb3BzLm1hc3RlckF1dGhTb3VyY2UgJiYgc2VsZWN0ZWRTb3VyY2UgPT09IHByb3BzLm1hc3RlckF1dGhTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbJ3VzZXJpZCddID0gc2VsZWN0ZWRTb3VyY2UgKyBwcm9wcy51c2VySWRTZXBhcmF0b3IgKyBwYXJhbXNbJ3VzZXJpZCddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJBZGRpdGlvbmFsQ29tcG9uZW50cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJBZGRpdGlvbmFsQ29tcG9uZW50cyhwcm9wcywgc3RhdGUsIGFjY3VtdWxhdG9yKSB7XG5cbiAgICAgICAgICAgIGlmICghcHJvcHMuYXV0aFNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZmluZCBhdXRoU291cmNlcycpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjY3VtdWxhdG9yLnRvcC5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoTXVsdGlBdXRoU2VsZWN0b3IsIF9leHRlbmRzKHsgcmVmOiAnbXVsdGlfc2VsZWN0b3InIH0sIHByb3BzLCB7IHBhcmVudFN0YXRlOiBzdGF0ZSB9KSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIE11bHRpQXV0aE1vZGlmaWVyO1xufSkoUHlkaW9SZWFjdFVJLkFic3RyYWN0RGlhbG9nTW9kaWZpZXIpO1xuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ3Nlc3Npb25Mb2dvdXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2Vzc2lvbkxvZ291dCgpIHtcblxuICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkuc2Vzc2lvbkxvZ291dCgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2dpblBhc3N3b3JkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZ2luUGFzc3dvcmQoKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ0xvZ2luUGFzc3dvcmREaWFsb2cnLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgYmx1cjogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxudmFyIFJlc2V0UGFzc3dvcmRSZXF1aXJlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUmVzZXRQYXNzd29yZFJlcXVpcmUnLFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ1Jlc2V0UGFzc3dvcmRSZXF1aXJlJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICB1c2VCbHVyOiBmdW5jdGlvbiB1c2VCbHVyKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignbG9naW4nKTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucmVmcy5pbnB1dCAmJiB0aGlzLnJlZnMuaW5wdXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Ub2tlblNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICBhcGkucmVzZXRQYXNzd29yZFRva2VuKHZhbHVlKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IHZhbHVlU3VibWl0dGVkOiB0cnVlIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIHZhbHVlU3VibWl0dGVkID0gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLnZhbHVlU3VibWl0dGVkO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICF2YWx1ZVN1Ym1pdHRlZCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZGlhbG9nTGVnZW5kJyB9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzWydndWkudXNlci4zJ11cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdmFsdWVTdWJtaXR0ZWQgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjUnXVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBSZXNldFBhc3N3b3JkRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUmVzZXRQYXNzd29yZERpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdSZXNldFBhc3N3b3JkRGlhbG9nJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWVTdWJtaXR0ZWQ6IGZhbHNlLCBmb3JtTG9hZGVkOiBmYWxzZSwgcGFzc1ZhbHVlOiBudWxsLCB1c2VySWQ6IG51bGwgfTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRlJPTlRFTkRfVVJMJykgKyAnL2xvZ2luJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtZXNzID0gcHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVG9rZW5TZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFJlc2V0UGFzc3dvcmRSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3QuVXNlckxvZ2luID0gdGhpcy5zdGF0ZS51c2VySWQ7XG4gICAgICAgIHJlcXVlc3QuUmVzZXRQYXNzd29yZFRva2VuID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ1VTRVJfQUNUSU9OX0tFWScpO1xuICAgICAgICByZXF1ZXN0Lk5ld1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS5wYXNzVmFsdWU7XG4gICAgICAgIGFwaS5yZXNldFBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM1LnNldFN0YXRlKHsgdmFsdWVTdWJtaXR0ZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBhbGVydChtZXNzWzI0MF0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICBQcm9taXNlLnJlc29sdmUocmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdmb3JtJywgdHJ1ZSkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM2LnNldFN0YXRlKHsgZm9ybUxvYWRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUGFzc0NoYW5nZTogZnVuY3Rpb24gb25QYXNzQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFzc1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgb25Vc2VySWRDaGFuZ2U6IGZ1bmN0aW9uIG9uVXNlcklkQ2hhbmdlKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcklkOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IF9zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgdmFyIGZvcm1Mb2FkZWQgPSBfc3RhdGUuZm9ybUxvYWRlZDtcbiAgICAgICAgdmFyIHBhc3NWYWx1ZSA9IF9zdGF0ZS5wYXNzVmFsdWU7XG4gICAgICAgIHZhciB1c2VySWQgPSBfc3RhdGUudXNlcklkO1xuXG4gICAgICAgIGlmICghdmFsdWVTdWJtaXR0ZWQgJiYgZm9ybUxvYWRlZCkge1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuOCddXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Vc2VySWRDaGFuZ2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9Gb3JtLlZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uUGFzc0NoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IG5hbWU6ICdwYXNzd29yZCcsIGxhYmVsOiBtZXNzWzE5OF0gfSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhc3NWYWx1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuNiddXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9SZWFjdFVJLkxvYWRlciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbmV4cG9ydHMuTG9naW5QYXNzd29yZERpYWxvZyA9IExvZ2luUGFzc3dvcmREaWFsb2c7XG5leHBvcnRzLlJlc2V0UGFzc3dvcmRSZXF1aXJlID0gUmVzZXRQYXNzd29yZFJlcXVpcmU7XG5leHBvcnRzLlJlc2V0UGFzc3dvcmREaWFsb2cgPSBSZXNldFBhc3N3b3JkRGlhbG9nO1xuZXhwb3J0cy5NdWx0aUF1dGhNb2RpZmllciA9IE11bHRpQXV0aE1vZGlmaWVyO1xuIl19
