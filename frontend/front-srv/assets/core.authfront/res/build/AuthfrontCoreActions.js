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
        var params = {
            get_action: 'login',
            userid: login,
            password: this.refs.password.getValue(),
            login_seed: -1
        };
        if (this.refs.captcha_input) {
            params['captcha_code'] = this.refs.captcha_input.getValue();
        }
        if (this.state && this.state.rememberChecked) {
            params['remember_me'] = 'true';
        }
        if (this.props.modifiers) {
            this.props.modifiers.map((function (m) {
                m.enrichSubmitParameters(this.props, this.state, this.refs, params);
            }).bind(this));
        }
        restClient.jwtFromCredentials(login, this.refs.password.getValue()).then(function (r) {
            _this.dismiss();
        })['catch'](function (e) {
            _this.setState({ errorId: e.message });
        });
        /*
        client.request(params, function(responseObject){
            let success = client.parseXmlMessage(responseObject.responseXML);
            if(success){
                this.dismiss();
            }else{
                let errorId = PydioApi.getClient().LAST_ERROR_ID;
                if(errorId == '285' && passwordOnly){
                    errorId = '553';
                }
                this.setState({errorId: errorId});
                if(responseObject.responseXML && XMLUtils.XPathGetSingleNodeText(responseObject.responseXML.documentElement, "logging_result/@value") === '-4'){
                    this.setState({displayCaptcha: true});
                }
             }
        }.bind(this));
        */
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

    componentWillReceiveProps: function componentWillReceiveProps() {
        this.setState({ displayCaptcha: false });
        _pydioHttpApi2['default'].getClient().request({ get_action: "get_seed" }, (function (transport) {
            if (transport.responseJSON) this.setState({ displayCaptcha: true });
        }).bind(this));
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
                pydio.MessageHash[this.state.errorId]
            );
        }
        var captcha = undefined;
        if (this.state.displayCaptcha) {
            captcha = React.createElement(
                'div',
                { className: 'captcha_container' },
                React.createElement(_materialUi.TextField, { style: { width: 170, marginTop: -20 }, hintText: pydio.MessageHash[390], ref: 'captcha_input', onKeyDown: this.submitOnEnterKey }),
                React.createElement('img', { src: this.state.globalParameters.get('ajxpServerAccess') + '&get_action=get_captcha&sid=' + Math.random() })
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
            React.createElement('div', { style: logoStyle }),
            React.createElement(
                'div',
                { className: 'dialogLegend', style: { fontSize: 22, paddingBottom: 12, lineHeight: '28px' } },
                pydio.MessageHash[passwordOnly ? 552 : 180],
                languageMenu
            ),
            errorMessage,
            captcha,
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

var WebFTPDialog = React.createClass({
    displayName: 'WebFTPDialog',

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.SubmitButtonProviderMixin, LoginDialogMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash[163],
            dialogIsModal: true
        };
    },

    submit: function submit() {

        var client = _pydioHttpApi2['default'].getClient();
        client.request({
            get_action: 'set_ftp_data',
            FTP_HOST: this.refs.FTP_HOST.getValue(),
            FTP_PORT: this.refs.FTP_PORT.getValue(),
            PATH: this.refs.PATH.getValue(),
            CHARSET: this.refs.CHARSET.getValue(),
            FTP_SECURE: this.refs.FTP_SECURE.isToggled() ? 'TRUE' : 'FALSE',
            FTP_DIRECT: this.refs.FTP_DIRECT.isToggled() ? 'TRUE' : 'FALSE'
        }, (function () {

            this.postLoginData(client);
        }).bind(this));
    },

    render: function render() {

        var messages = pydio.MessageHash;
        var tFieldStyle = { width: '100%' };
        var errorMessage = undefined;
        if (this.state.errorId) {
            errorMessage = React.createElement(
                'div',
                { 'class': 'ajxp_login_error' },
                pydio.MessageHash[this.state.errorId]
            );
        }
        var captcha = undefined;
        if (this.state.displayCaptcha) {
            captcha = React.createElement(
                'div',
                { className: 'captcha_container' },
                React.createElement('img', { src: this.state.globalParameters.get('ajxpServerAccess') + '&get_action=get_captcha&sid=' + Math.random() }),
                React.createElement(_materialUi.TextField, { floatingLabelText: pydio.MessageHash[390], ref: 'captcha_input' })
            );
        }

        return React.createElement(
            'div',
            null,
            captcha,
            React.createElement(
                'table',
                { cellPadding: 5, border: '0', style: { width: 370 } },
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { colspan: '2' },
                        React.createElement(
                            'div',
                            { 'class': 'dialogLegend' },
                            messages['ftp_auth.1']
                        )
                    )
                ),
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, style: tFieldStyle, ref: 'FTP_HOST', floatingLabelText: messages['ftp_auth.2'] })
                    ),
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, ref: 'FTP_PORT', style: tFieldStyle, defaultValue: '21', floatingLabelText: messages['ftp_auth.8'] })
                    )
                ),
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, style: tFieldStyle, ref: 'login', floatingLabelText: messages['181'] })
                    ),
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, style: tFieldStyle, ref: 'password', type: 'password', floatingLabelText: messages['182'] })
                    )
                ),
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { colspan: '2', style: { padding: '15px 5px 0' } },
                        React.createElement(
                            'div',
                            { 'class': 'dialogLegend' },
                            messages['ftp_auth.3']
                        )
                    )
                ),
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, style: tFieldStyle, ref: 'PATH', defaultValue: '/', floatingLabelText: messages['ftp_auth.4'] })
                    ),
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.Toggle, { ref: 'FTP_SECURE', label: messages['ftp_auth.5'], labelPosition: 'right' })
                    )
                ),
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.TextField, { fullWidth: true, style: tFieldStyle, ref: 'CHARSET', floatingLabelText: messages['ftp_auth.6'] })
                    ),
                    React.createElement(
                        'td',
                        { style: { padding: '0 5px' } },
                        React.createElement(_materialUi.Toggle, { ref: 'FTP_DIRECT', label: messages['ftp_auth.7'], labelPosition: 'right' })
                    )
                )
            ),
            errorMessage
        );
    }

});

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'sessionLogout',
        value: function sessionLogout() {

            _pydioHttpApi2['default'].clearRememberData();
            _pydioHttpApi2['default'].getRestClient().sessionLogout();
        }
    }, {
        key: 'loginPassword',
        value: function loginPassword() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'LoginPasswordDialog', _extends({}, props, { blur: true }));
        }
    }, {
        key: 'webFTP',
        value: function webFTP() {

            pydio.UI.openComponentInModal('AuthfrontCoreActions', 'WebFTPDialog');
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
exports.WebFTPDialog = WebFTPDialog;
exports.MultiAuthModifier = MultiAuthModifier;

},{"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api"}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ29yZUFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKFwicHlkaW8vaHR0cC9hcGlcIik7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoXCJweWRpby9odHRwL3Jlc3QtYXBpXCIpO1xuXG52YXIgcHlkaW8gPSB3aW5kb3cucHlkaW87XG5cbnZhciBMb2dpbkRpYWxvZ01peGluID0ge1xuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnbG9iYWxQYXJhbWV0ZXJzOiBweWRpby5QYXJhbWV0ZXJzLFxuICAgICAgICAgICAgYXV0aFBhcmFtZXRlcnM6IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2F1dGgnKSxcbiAgICAgICAgICAgIGVycm9ySWQ6IG51bGwsXG4gICAgICAgICAgICBkaXNwbGF5Q2FwdGNoYTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcG9zdExvZ2luRGF0YTogZnVuY3Rpb24gcG9zdExvZ2luRGF0YShyZXN0Q2xpZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgbG9naW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwYXNzd29yZE9ubHkpIHtcbiAgICAgICAgICAgIGxvZ2luID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUFJFU0VUX0xPR0lOJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dpbiA9IHRoaXMucmVmcy5sb2dpbi5nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICBnZXRfYWN0aW9uOiAnbG9naW4nLFxuICAgICAgICAgICAgdXNlcmlkOiBsb2dpbixcbiAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLnJlZnMucGFzc3dvcmQuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIGxvZ2luX3NlZWQ6IC0xXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnJlZnMuY2FwdGNoYV9pbnB1dCkge1xuICAgICAgICAgICAgcGFyYW1zWydjYXB0Y2hhX2NvZGUnXSA9IHRoaXMucmVmcy5jYXB0Y2hhX2lucHV0LmdldFZhbHVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5yZW1lbWJlckNoZWNrZWQpIHtcbiAgICAgICAgICAgIHBhcmFtc1sncmVtZW1iZXJfbWUnXSA9ICd0cnVlJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubW9kaWZpZXJzLm1hcCgoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICBtLmVucmljaFN1Ym1pdFBhcmFtZXRlcnModGhpcy5wcm9wcywgdGhpcy5zdGF0ZSwgdGhpcy5yZWZzLCBwYXJhbXMpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdENsaWVudC5qd3RGcm9tQ3JlZGVudGlhbHMobG9naW4sIHRoaXMucmVmcy5wYXNzd29yZC5nZXRWYWx1ZSgpKS50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICBfdGhpcy5kaXNtaXNzKCk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVycm9ySWQ6IGUubWVzc2FnZSB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8qXG4gICAgICAgIGNsaWVudC5yZXF1ZXN0KHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2VPYmplY3Qpe1xuICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBjbGllbnQucGFyc2VYbWxNZXNzYWdlKHJlc3BvbnNlT2JqZWN0LnJlc3BvbnNlWE1MKTtcbiAgICAgICAgICAgIGlmKHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbGV0IGVycm9ySWQgPSBQeWRpb0FwaS5nZXRDbGllbnQoKS5MQVNUX0VSUk9SX0lEO1xuICAgICAgICAgICAgICAgIGlmKGVycm9ySWQgPT0gJzI4NScgJiYgcGFzc3dvcmRPbmx5KXtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JJZCA9ICc1NTMnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnJvcklkOiBlcnJvcklkfSk7XG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2VPYmplY3QucmVzcG9uc2VYTUwgJiYgWE1MVXRpbHMuWFBhdGhHZXRTaW5nbGVOb2RlVGV4dChyZXNwb25zZU9iamVjdC5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQsIFwibG9nZ2luZ19yZXN1bHQvQHZhbHVlXCIpID09PSAnLTQnKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGlzcGxheUNhcHRjaGE6IHRydWV9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAqL1xuICAgIH1cbn07XG5cbnZhciBMb2dpblBhc3N3b3JkRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnTG9naW5QYXNzd29yZERpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluLCBMb2dpbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLCAvL3B5ZGlvLk1lc3NhZ2VIYXNoWzE2M10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgcmVtZW1iZXJDaGVja2VkOiBmYWxzZSB9O1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZGlzcGxheUNhcHRjaGE6IGZhbHNlIH0pO1xuICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpLnJlcXVlc3QoeyBnZXRfYWN0aW9uOiBcImdldF9zZWVkXCIgfSwgKGZ1bmN0aW9uICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc3BvcnQucmVzcG9uc2VKU09OKSB0aGlzLnNldFN0YXRlKHsgZGlzcGxheUNhcHRjaGE6IHRydWUgfSk7XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIGNsaWVudCA9IF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpO1xuICAgICAgICB0aGlzLnBvc3RMb2dpbkRhdGEoY2xpZW50KTtcbiAgICB9LFxuXG4gICAgZmlyZUZvcmdvdFBhc3N3b3JkOiBmdW5jdGlvbiBmaXJlRm9yZ290UGFzc3dvcmQoZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZmlyZUFjdGlvbih0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldChcIkZPUkdPVF9QQVNTV09SRF9BQ1RJT05cIikpO1xuICAgIH0sXG5cbiAgICB1c2VCbHVyOiBmdW5jdGlvbiB1c2VCbHVyKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgZ2V0QnV0dG9uczogZnVuY3Rpb24gZ2V0QnV0dG9ucygpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgc2VjdXJlTG9naW5Gb3JtID0gcGFzc3dvcmRPbmx5IHx8IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdTRUNVUkVfTE9HSU5fRk9STScpO1xuXG4gICAgICAgIHZhciBlbnRlckJ1dHRvbiA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBpZDogJ2RpYWxvZy1sb2dpbi1zdWJtaXQnLCAnZGVmYXVsdCc6IHRydWUsIGxhYmVsU3R5bGU6IHsgY29sb3I6ICd3aGl0ZScgfSwga2V5OiAnZW50ZXInLCBsYWJlbDogcHlkaW8uTWVzc2FnZUhhc2hbNjE3XSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczIuc3VibWl0KCk7XG4gICAgICAgICAgICB9IH0pO1xuICAgICAgICB2YXIgYnV0dG9ucyA9IFtdO1xuICAgICAgICBpZiAoZmFsc2UgJiYgIXNlY3VyZUxvZ2luRm9ybSkge1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgRGFya1RoZW1lQ29udGFpbmVyLFxuICAgICAgICAgICAgICAgIHsga2V5OiAncmVtZW1iZXInLCBzdHlsZTogeyBmbGV4OiAxLCB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZ0xlZnQ6IDE2IH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsyNjFdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxMyB9LCBvbkNoZWNrOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcmVtZW1iZXJDaGVja2VkOiBjIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChlbnRlckJ1dHRvbik7XG4gICAgICAgICAgICByZXR1cm4gW1JlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH0gfSxcbiAgICAgICAgICAgICAgICBidXR0b25zXG4gICAgICAgICAgICApXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbZW50ZXJCdXR0b25dO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICB2YXIgcGFzc3dvcmRPbmx5ID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUEFTU1dPUkRfQVVUSF9PTkxZJyk7XG4gICAgICAgIHZhciBzZWN1cmVMb2dpbkZvcm0gPSBwYXNzd29yZE9ubHkgfHwgdGhpcy5zdGF0ZS5hdXRoUGFyYW1ldGVycy5nZXQoJ1NFQ1VSRV9MT0dJTl9GT1JNJyk7XG4gICAgICAgIHZhciBmb3Jnb3RQYXNzd29yZExpbmsgPSB0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldCgnRU5BQkxFX0ZPUkdPVF9QQVNTV09SRCcpICYmICFwYXNzd29yZE9ubHk7XG5cbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3JJZCkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2FqeHBfbG9naW5fZXJyb3InIH0sXG4gICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbdGhpcy5zdGF0ZS5lcnJvcklkXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FwdGNoYSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGlzcGxheUNhcHRjaGEpIHtcbiAgICAgICAgICAgIGNhcHRjaGEgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnY2FwdGNoYV9jb250YWluZXInIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgc3R5bGU6IHsgd2lkdGg6IDE3MCwgbWFyZ2luVG9wOiAtMjAgfSwgaGludFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzM5MF0sIHJlZjogJ2NhcHRjaGFfaW5wdXQnLCBvbktleURvd246IHRoaXMuc3VibWl0T25FbnRlcktleSB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbWcnLCB7IHNyYzogdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnYWp4cFNlcnZlckFjY2VzcycpICsgJyZnZXRfYWN0aW9uPWdldF9jYXB0Y2hhJnNpZD0nICsgTWF0aC5yYW5kb20oKSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9yZ290TGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGZvcmdvdFBhc3N3b3JkTGluaykge1xuICAgICAgICAgICAgZm9yZ290TGluayA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdmb3Jnb3QtcGFzc3dvcmQtbGluaycgfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnYScsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicgfSwgb25DbGljazogdGhpcy5maXJlRm9yZ290UGFzc3dvcmQgfSxcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbNDc5XVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFkZGl0aW9uYWxDb21wb25lbnRzVG9wID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNCb3R0b20gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1vZGlmaWVycykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tcHMgPSB7IHRvcDogW10sIGJvdHRvbTogW10gfTtcbiAgICAgICAgICAgICAgICBfdGhpczMucHJvcHMubW9kaWZpZXJzLm1hcCgoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgbS5yZW5kZXJBZGRpdGlvbmFsQ29tcG9uZW50cyh0aGlzLnByb3BzLCB0aGlzLnN0YXRlLCBjb21wcyk7XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczMpKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcHMudG9wLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wcy50b3BcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBzLmJvdHRvbS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNCb3R0b20gPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMuYm90dG9tXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjdXN0b20gPSB0aGlzLnByb3BzLnB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdjdXN0b21Xb3JkaW5nJyk7XG4gICAgICAgIHZhciBsb2dvVXJsID0gY3VzdG9tLmljb247XG4gICAgICAgIGlmIChjdXN0b20uaWNvbl9iaW5hcnlfdXJsKSB7XG4gICAgICAgICAgICBsb2dvVXJsID0gdGhpcy5wcm9wcy5weWRpby5QYXJhbWV0ZXJzLmdldCgnYWp4cFNlcnZlckFjY2VzcycpICsgJyYnICsgY3VzdG9tLmljb25fYmluYXJ5X3VybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2dvU3R5bGUgPSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogJ2NvbnRhaW4nLFxuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBsb2dvVXJsICsgJyknLFxuICAgICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRSZXBlYXQ6ICduby1yZXBlYXQnLFxuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICB0b3A6IC0xMzAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgd2lkdGg6IDMyMCxcbiAgICAgICAgICAgIGhlaWdodDogMTIwXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxhbmd1YWdlcyA9IFtdO1xuICAgICAgICBweWRpby5saXN0TGFuZ3VhZ2VzV2l0aENhbGxiYWNrKGZ1bmN0aW9uIChrZXksIGxhYmVsLCBjdXJyZW50KSB7XG4gICAgICAgICAgICBsYW5ndWFnZXMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLk1lbnVJdGVtLCB7IHByaW1hcnlUZXh0OiBsYWJlbCwgdmFsdWU6IGtleSwgcmlnaHRJY29uOiBjdXJyZW50ID8gUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5Gb250SWNvbiwgeyBjbGFzc05hbWU6ICdtZGkgbWRpLWNoZWNrJyB9KSA6IG51bGwgfSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxhbmd1YWdlTWVudSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBfbWF0ZXJpYWxVaS5JY29uTWVudSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IHRvb2x0aXA6IHB5ZGlvLk1lc3NhZ2VIYXNoWzYxOF0sIGljb25DbGFzc05hbWU6ICdtZGkgbWRpLWZsYWctb3V0bGluZS12YXJpYW50JywgaWNvblN0eWxlOiB7IGZvbnRTaXplOiAyMCwgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LC42NyknIH0gfSksXG4gICAgICAgICAgICAgICAgb25JdGVtVG91Y2hUYXA6IGZ1bmN0aW9uIChlLCBvKSB7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmxvYWRJMThOTWVzc2FnZXMoby5wcm9wcy52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXNrdG9wOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGFuZ3VhZ2VzXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBEYXJrVGhlbWVDb250YWluZXIsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgeyBzdHlsZTogbG9nb1N0eWxlIH0pLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcsIHN0eWxlOiB7IGZvbnRTaXplOiAyMiwgcGFkZGluZ0JvdHRvbTogMTIsIGxpbmVIZWlnaHQ6ICcyOHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbcGFzc3dvcmRPbmx5ID8gNTUyIDogMTgwXSxcbiAgICAgICAgICAgICAgICBsYW5ndWFnZU1lbnVcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICBjYXB0Y2hhLFxuICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNUb3AsXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIiB9LFxuICAgICAgICAgICAgICAgICFwYXNzd29yZE9ubHkgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIixcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE4MV0sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLnN1Ym1pdE9uRW50ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbi1sb2dpbidcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2FwcGxpY2F0aW9uLXBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE4Ml0sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLnN1Ym1pdE9uRW50ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNCb3R0b20sXG4gICAgICAgICAgICBmb3Jnb3RMaW5rXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIERhcmtUaGVtZUNvbnRhaW5lciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEYXJrVGhlbWVDb250YWluZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRGFya1RoZW1lQ29udGFpbmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGFya1RoZW1lQ29udGFpbmVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEYXJrVGhlbWVDb250YWluZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRGFya1RoZW1lQ29udGFpbmVyLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG5cbiAgICAgICAgICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMsIFsnbXVpVGhlbWUnXSk7XG5cbiAgICAgICAgICAgIHZhciBiYXNlVGhlbWUgPSBfZXh0ZW5kcyh7fSwgX21hdGVyaWFsVWlTdHlsZXMuZGFya0Jhc2VUaGVtZSk7XG4gICAgICAgICAgICBiYXNlVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yID0gbXVpVGhlbWUucGFsZXR0ZS5hY2NlbnQxQ29sb3I7XG4gICAgICAgICAgICB2YXIgZGFya1RoZW1lID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLmdldE11aVRoZW1lKShiYXNlVGhlbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NdWlUaGVtZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHsgbXVpVGhlbWU6IGRhcmtUaGVtZSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHByb3BzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEYXJrVGhlbWVDb250YWluZXI7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5EYXJrVGhlbWVDb250YWluZXIgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKERhcmtUaGVtZUNvbnRhaW5lcik7XG5cbnZhciBNdWx0aUF1dGhTZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ011bHRpQXV0aFNlbGVjdG9yJyxcblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsdWU7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogT2JqZWN0LmtleXModGhpcy5wcm9wcy5hdXRoU291cmNlcykuc2hpZnQoKSB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2Uob2JqZWN0LCBrZXksIHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBwYXlsb2FkIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wcy5hdXRoU291cmNlcykge1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdGhpcy5wcm9wcy5hdXRoU291cmNlc1trZXldIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9tYXRlcmlhbFVpLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiAnTG9naW4gYXMuLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBNdWx0aUF1dGhNb2RpZmllciA9IChmdW5jdGlvbiAoX1B5ZGlvUmVhY3RVSSRBYnN0cmFjdERpYWxvZ01vZGlmaWVyKSB7XG4gICAgX2luaGVyaXRzKE11bHRpQXV0aE1vZGlmaWVyLCBfUHlkaW9SZWFjdFVJJEFic3RyYWN0RGlhbG9nTW9kaWZpZXIpO1xuXG4gICAgZnVuY3Rpb24gTXVsdGlBdXRoTW9kaWZpZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNdWx0aUF1dGhNb2RpZmllcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTXVsdGlBdXRoTW9kaWZpZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTXVsdGlBdXRoTW9kaWZpZXIsIFt7XG4gICAgICAgIGtleTogJ2VucmljaFN1Ym1pdFBhcmFtZXRlcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW5yaWNoU3VibWl0UGFyYW1ldGVycyhwcm9wcywgc3RhdGUsIHJlZnMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRTb3VyY2UgPSByZWZzLm11bHRpX3NlbGVjdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBwYXJhbXNbJ2F1dGhfc291cmNlJ10gPSBzZWxlY3RlZFNvdXJjZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5tYXN0ZXJBdXRoU291cmNlICYmIHNlbGVjdGVkU291cmNlID09PSBwcm9wcy5tYXN0ZXJBdXRoU291cmNlKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zWyd1c2VyaWQnXSA9IHNlbGVjdGVkU291cmNlICsgcHJvcHMudXNlcklkU2VwYXJhdG9yICsgcGFyYW1zWyd1c2VyaWQnXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMocHJvcHMsIHN0YXRlLCBhY2N1bXVsYXRvcikge1xuXG4gICAgICAgICAgICBpZiAoIXByb3BzLmF1dGhTb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZpbmQgYXV0aFNvdXJjZXMnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY2N1bXVsYXRvci50b3AucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE11bHRpQXV0aFNlbGVjdG9yLCBfZXh0ZW5kcyh7IHJlZjogJ211bHRpX3NlbGVjdG9yJyB9LCBwcm9wcywgeyBwYXJlbnRTdGF0ZTogc3RhdGUgfSkpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNdWx0aUF1dGhNb2RpZmllcjtcbn0pKFB5ZGlvUmVhY3RVSS5BYnN0cmFjdERpYWxvZ01vZGlmaWVyKTtcblxudmFyIFdlYkZUUERpYWxvZyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1dlYkZUUERpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluLCBMb2dpbkRpYWxvZ01peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE2M10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuXG4gICAgICAgIHZhciBjbGllbnQgPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldENsaWVudCgpO1xuICAgICAgICBjbGllbnQucmVxdWVzdCh7XG4gICAgICAgICAgICBnZXRfYWN0aW9uOiAnc2V0X2Z0cF9kYXRhJyxcbiAgICAgICAgICAgIEZUUF9IT1NUOiB0aGlzLnJlZnMuRlRQX0hPU1QuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIEZUUF9QT1JUOiB0aGlzLnJlZnMuRlRQX1BPUlQuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIFBBVEg6IHRoaXMucmVmcy5QQVRILmdldFZhbHVlKCksXG4gICAgICAgICAgICBDSEFSU0VUOiB0aGlzLnJlZnMuQ0hBUlNFVC5nZXRWYWx1ZSgpLFxuICAgICAgICAgICAgRlRQX1NFQ1VSRTogdGhpcy5yZWZzLkZUUF9TRUNVUkUuaXNUb2dnbGVkKCkgPyAnVFJVRScgOiAnRkFMU0UnLFxuICAgICAgICAgICAgRlRQX0RJUkVDVDogdGhpcy5yZWZzLkZUUF9ESVJFQ1QuaXNUb2dnbGVkKCkgPyAnVFJVRScgOiAnRkFMU0UnXG4gICAgICAgIH0sIChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMucG9zdExvZ2luRGF0YShjbGllbnQpO1xuICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gcHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciB0RmllbGRTdHlsZSA9IHsgd2lkdGg6ICcxMDAlJyB9O1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcklkKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgJ2NsYXNzJzogJ2FqeHBfbG9naW5fZXJyb3InIH0sXG4gICAgICAgICAgICAgICAgcHlkaW8uTWVzc2FnZUhhc2hbdGhpcy5zdGF0ZS5lcnJvcklkXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FwdGNoYSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGlzcGxheUNhcHRjaGEpIHtcbiAgICAgICAgICAgIGNhcHRjaGEgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnY2FwdGNoYV9jb250YWluZXInIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudCgnaW1nJywgeyBzcmM6IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ2FqeHBTZXJ2ZXJBY2Nlc3MnKSArICcmZ2V0X2FjdGlvbj1nZXRfY2FwdGNoYSZzaWQ9JyArIE1hdGgucmFuZG9tKCkgfSksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzM5MF0sIHJlZjogJ2NhcHRjaGFfaW5wdXQnIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBjYXB0Y2hhLFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAndGFibGUnLFxuICAgICAgICAgICAgICAgIHsgY2VsbFBhZGRpbmc6IDUsIGJvcmRlcjogJzAnLCBzdHlsZTogeyB3aWR0aDogMzcwIH0gfSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAndHInLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgY29sc3BhbjogJzInIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJ2NsYXNzJzogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1snZnRwX2F1dGguMSddXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICd0cicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA1cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgc3R5bGU6IHRGaWVsZFN0eWxlLCByZWY6ICdGVFBfSE9TVCcsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1snZnRwX2F1dGguMiddIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA1cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgcmVmOiAnRlRQX1BPUlQnLCBzdHlsZTogdEZpZWxkU3R5bGUsIGRlZmF1bHRWYWx1ZTogJzIxJywgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NhZ2VzWydmdHBfYXV0aC44J10gfSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICd0ZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDVweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHsgZnVsbFdpZHRoOiB0cnVlLCBzdHlsZTogdEZpZWxkU3R5bGUsIHJlZjogJ2xvZ2luJywgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NhZ2VzWycxODEnXSB9KVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgNXB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBmdWxsV2lkdGg6IHRydWUsIHN0eWxlOiB0RmllbGRTdHlsZSwgcmVmOiAncGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnLCBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc2FnZXNbJzE4MiddIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICd0cicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjb2xzcGFuOiAnMicsIHN0eWxlOiB7IHBhZGRpbmc6ICcxNXB4IDVweCAwJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJ2NsYXNzJzogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlc1snZnRwX2F1dGguMyddXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICd0cicsXG4gICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA1cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgc3R5bGU6IHRGaWVsZFN0eWxlLCByZWY6ICdQQVRIJywgZGVmYXVsdFZhbHVlOiAnLycsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1snZnRwX2F1dGguNCddIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA1cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IHJlZjogJ0ZUUF9TRUNVUkUnLCBsYWJlbDogbWVzc2FnZXNbJ2Z0cF9hdXRoLjUnXSwgbGFiZWxQb3NpdGlvbjogJ3JpZ2h0JyB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAndHInLFxuICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgNXB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBmdWxsV2lkdGg6IHRydWUsIHN0eWxlOiB0RmllbGRTdHlsZSwgcmVmOiAnQ0hBUlNFVCcsIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzYWdlc1snZnRwX2F1dGguNiddIH0pXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCA1cHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVG9nZ2xlLCB7IHJlZjogJ0ZUUF9ESVJFQ1QnLCBsYWJlbDogbWVzc2FnZXNbJ2Z0cF9hdXRoLjcnXSwgbGFiZWxQb3NpdGlvbjogJ3JpZ2h0JyB9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnc2Vzc2lvbkxvZ291dCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXNzaW9uTG9nb3V0KCkge1xuXG4gICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmNsZWFyUmVtZW1iZXJEYXRhKCk7XG4gICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKS5zZXNzaW9uTG9nb3V0KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvZ2luUGFzc3dvcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9naW5QYXNzd29yZCgpIHtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnQXV0aGZyb250Q29yZUFjdGlvbnMnLCAnTG9naW5QYXNzd29yZERpYWxvZycsIF9leHRlbmRzKHt9LCBwcm9wcywgeyBibHVyOiB0cnVlIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnd2ViRlRQJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHdlYkZUUCgpIHtcblxuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ1dlYkZUUERpYWxvZycpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBSZXNldFBhc3N3b3JkUmVxdWlyZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1Jlc2V0UGFzc3dvcmRSZXF1aXJlJyxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4sIFB5ZGlvUmVhY3RVSS5DYW5jZWxCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdSZXNldFBhc3N3b3JkUmVxdWlyZScsIHsgYmx1cjogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiBweWRpby5NZXNzYWdlSGFzaFsnZ3VpLnVzZXIuMSddLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbSdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGNhbmNlbDogZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICBweWRpby5Db250cm9sbGVyLmZpcmVBY3Rpb24oJ2xvZ2luJyk7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICB2YXIgdmFsdWVTdWJtaXR0ZWQgPSB0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUudmFsdWVTdWJtaXR0ZWQ7XG4gICAgICAgIGlmICh2YWx1ZVN1Ym1pdHRlZCkge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnJlZnMuaW5wdXQgJiYgdGhpcy5yZWZzLmlucHV0LmdldFZhbHVlKCk7XG4gICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVG9rZW5TZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgYXBpLnJlc2V0UGFzc3dvcmRUb2tlbih2YWx1ZSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyB2YWx1ZVN1Ym1pdHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAhdmFsdWVTdWJtaXR0ZWQgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuMyddXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzWydndWkudXNlci40J11cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHZhbHVlU3VibWl0dGVkICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBtZXNzWydndWkudXNlci41J11cbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgUmVzZXRQYXNzd29yZERpYWxvZyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ1Jlc2V0UGFzc3dvcmREaWFsb2cnLFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBzdGF0aWNzOiB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uIG9wZW4oKSB7XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnQXV0aGZyb250Q29yZUFjdGlvbnMnLCAnUmVzZXRQYXNzd29yZERpYWxvZycsIHsgYmx1cjogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiBweWRpby5NZXNzYWdlSGFzaFsnZ3VpLnVzZXIuMSddLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbSdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHZhbHVlU3VibWl0dGVkOiBmYWxzZSwgZm9ybUxvYWRlZDogZmFsc2UsIHBhc3NWYWx1ZTogbnVsbCwgdXNlcklkOiBudWxsIH07XG4gICAgfSxcblxuICAgIHVzZUJsdXI6IGZ1bmN0aW9uIHVzZUJsdXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5wcm9wcy5weWRpbztcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ0ZST05URU5EX1VSTCcpICsgJy9sb2dpbic7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWVzcyA9IHB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlRva2VuU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLlJlc3RSZXNldFBhc3N3b3JkUmVxdWVzdCgpO1xuICAgICAgICByZXF1ZXN0LlVzZXJMb2dpbiA9IHRoaXMuc3RhdGUudXNlcklkO1xuICAgICAgICByZXF1ZXN0LlJlc2V0UGFzc3dvcmRUb2tlbiA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdVU0VSX0FDVElPTl9LRVknKTtcbiAgICAgICAgcmVxdWVzdC5OZXdQYXNzd29yZCA9IHRoaXMuc3RhdGUucGFzc1ZhbHVlO1xuICAgICAgICBhcGkucmVzZXRQYXNzd29yZChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNS5zZXRTdGF0ZSh7IHZhbHVlU3VibWl0dGVkOiB0cnVlIH0pO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgYWxlcnQobWVzc1syNDBdKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignZm9ybScsIHRydWUpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNi5zZXRTdGF0ZSh7IGZvcm1Mb2FkZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvblBhc3NDaGFuZ2U6IGZ1bmN0aW9uIG9uUGFzc0NoYW5nZShuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhc3NWYWx1ZTogbmV3VmFsdWUgfSk7XG4gICAgfSxcblxuICAgIG9uVXNlcklkQ2hhbmdlOiBmdW5jdGlvbiBvblVzZXJJZENoYW5nZShldmVudCwgbmV3VmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJJZDogbmV3VmFsdWUgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgdmFsdWVTdWJtaXR0ZWQgPSBfc3RhdGUudmFsdWVTdWJtaXR0ZWQ7XG4gICAgICAgIHZhciBmb3JtTG9hZGVkID0gX3N0YXRlLmZvcm1Mb2FkZWQ7XG4gICAgICAgIHZhciBwYXNzVmFsdWUgPSBfc3RhdGUucGFzc1ZhbHVlO1xuICAgICAgICB2YXIgdXNlcklkID0gX3N0YXRlLnVzZXJJZDtcblxuICAgICAgICBpZiAoIXZhbHVlU3VibWl0dGVkICYmIGZvcm1Mb2FkZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkaWFsb2dMZWdlbmQnIH0sXG4gICAgICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjgnXVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBtZXNzWydndWkudXNlci40J10sXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uVXNlcklkQ2hhbmdlLmJpbmQodGhpcylcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFB5ZGlvRm9ybS5WYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBhc3NDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBuYW1lOiAncGFzc3dvcmQnLCBsYWJlbDogbWVzc1sxOThdIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXNzVmFsdWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN1Ym1pdHRlZCkge1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjYnXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFB5ZGlvUmVhY3RVSS5Mb2FkZXIsIG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLkxvZ2luUGFzc3dvcmREaWFsb2cgPSBMb2dpblBhc3N3b3JkRGlhbG9nO1xuZXhwb3J0cy5SZXNldFBhc3N3b3JkUmVxdWlyZSA9IFJlc2V0UGFzc3dvcmRSZXF1aXJlO1xuZXhwb3J0cy5SZXNldFBhc3N3b3JkRGlhbG9nID0gUmVzZXRQYXNzd29yZERpYWxvZztcbmV4cG9ydHMuV2ViRlRQRGlhbG9nID0gV2ViRlRQRGlhbG9nO1xuZXhwb3J0cy5NdWx0aUF1dGhNb2RpZmllciA9IE11bHRpQXV0aE1vZGlmaWVyO1xuIl19
