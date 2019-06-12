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
            if (e.response && e.response.body) {
                _this.setState({ errorId: e.response.body.Title });
            } else if (e.response && e.response.text) {
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
        if (custom.iconBinary) {
            logoUrl = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + custom.iconBinary;
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
            console.log("HERE WE ARE");

            if (Pydio.getInstance().Parameters.get("PRELOG_USER")) {
                return;
            }

            _pydioHttpApi2['default'].getRestClient().sessionLogout()['finally'](function (e) {
                return window.location.href = pydio.Parameters.get('FRONTEND_URL') + '/logout';
            });
        }
    }, {
        key: 'loginPassword',
        value: function loginPassword() {
            var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (Pydio.getInstance().Parameters.get("PRELOG_USER")) {
                return;
            }

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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvQ29yZUFjdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMob2JqLCBrZXlzKSB7IHZhciB0YXJnZXQgPSB7fTsgZm9yICh2YXIgaSBpbiBvYmopIHsgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7IHRhcmdldFtpXSA9IG9ialtpXTsgfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKFwicHlkaW8vaHR0cC9hcGlcIik7XG5cbnZhciBfcHlkaW9IdHRwQXBpMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvSHR0cEFwaSk7XG5cbnZhciBfcHlkaW9IdHRwUmVzdEFwaSA9IHJlcXVpcmUoXCJweWRpby9odHRwL3Jlc3QtYXBpXCIpO1xuXG52YXIgcHlkaW8gPSB3aW5kb3cucHlkaW87XG5cbnZhciBMb2dpbkRpYWxvZ01peGluID0ge1xuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBnbG9iYWxQYXJhbWV0ZXJzOiBweWRpby5QYXJhbWV0ZXJzLFxuICAgICAgICAgICAgYXV0aFBhcmFtZXRlcnM6IHB5ZGlvLmdldFBsdWdpbkNvbmZpZ3MoJ2F1dGgnKSxcbiAgICAgICAgICAgIGVycm9ySWQ6IG51bGwsXG4gICAgICAgICAgICBkaXNwbGF5Q2FwdGNoYTogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgcG9zdExvZ2luRGF0YTogZnVuY3Rpb24gcG9zdExvZ2luRGF0YShyZXN0Q2xpZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgbG9naW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwYXNzd29yZE9ubHkpIHtcbiAgICAgICAgICAgIGxvZ2luID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUFJFU0VUX0xPR0lOJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dpbiA9IHRoaXMucmVmcy5sb2dpbi5nZXRWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3RDbGllbnQuand0RnJvbUNyZWRlbnRpYWxzKGxvZ2luLCB0aGlzLnJlZnMucGFzc3dvcmQuZ2V0VmFsdWUoKSkudGhlbihmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgaWYgKHIuZGF0YSAmJiByLmRhdGEuVHJpZ2dlcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMuZGlzbWlzcygpO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUucmVzcG9uc2UgJiYgZS5yZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcklkOiBlLnJlc3BvbnNlLmJvZHkuVGl0bGUgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUucmVzcG9uc2UgJiYgZS5yZXNwb25zZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcklkOiBlLnJlc3BvbnNlLnRleHQgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogZS5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5zZXRTdGF0ZSh7IGVycm9ySWQ6ICdMb2dpbiBmYWlsZWQhJyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxudmFyIExvZ2luUGFzc3dvcmREaWFsb2cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdMb2dpblBhc3N3b3JkRGlhbG9nJyxcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVSS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVJLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW4sIExvZ2luRGlhbG9nTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsIC8vcHlkaW8uTWVzc2FnZUhhc2hbMTYzXSxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IHRydWUsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnc20nXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyByZW1lbWJlckNoZWNrZWQ6IGZhbHNlIH07XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgY2xpZW50ID0gX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCk7XG4gICAgICAgIHRoaXMucG9zdExvZ2luRGF0YShjbGllbnQpO1xuICAgIH0sXG5cbiAgICBmaXJlRm9yZ290UGFzc3dvcmQ6IGZ1bmN0aW9uIGZpcmVGb3Jnb3RQYXNzd29yZChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KFwiRk9SR09UX1BBU1NXT1JEX0FDVElPTlwiKSk7XG4gICAgfSxcblxuICAgIHVzZUJsdXI6IGZ1bmN0aW9uIHVzZUJsdXIoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgcGFzc3dvcmRPbmx5ID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUEFTU1dPUkRfQVVUSF9PTkxZJyk7XG4gICAgICAgIHZhciBzZWN1cmVMb2dpbkZvcm0gPSBwYXNzd29yZE9ubHkgfHwgdGhpcy5zdGF0ZS5hdXRoUGFyYW1ldGVycy5nZXQoJ1NFQ1VSRV9MT0dJTl9GT1JNJyk7XG5cbiAgICAgICAgdmFyIGVudGVyQnV0dG9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGlkOiAnZGlhbG9nLWxvZ2luLXN1Ym1pdCcsICdkZWZhdWx0JzogdHJ1ZSwgbGFiZWxTdHlsZTogeyBjb2xvcjogJ3doaXRlJyB9LCBrZXk6ICdlbnRlcicsIGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFs2MTddLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5zdWJtaXQoKTtcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgIHZhciBidXR0b25zID0gW107XG4gICAgICAgIGlmIChmYWxzZSAmJiAhc2VjdXJlTG9naW5Gb3JtKSB7XG4gICAgICAgICAgICBidXR0b25zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBEYXJrVGhlbWVDb250YWluZXIsXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdyZW1lbWJlcicsIHN0eWxlOiB7IGZsZXg6IDEsIHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nTGVmdDogMTYgfSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQ2hlY2tib3gsIHsgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzI2MV0sIGxhYmVsU3R5bGU6IHsgZm9udFNpemU6IDEzIH0sIG9uQ2hlY2s6IGZ1bmN0aW9uIChlLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyByZW1lbWJlckNoZWNrZWQ6IGMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGVudGVyQnV0dG9uKTtcbiAgICAgICAgICAgIHJldHVybiBbUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfSB9LFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNcbiAgICAgICAgICAgICldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtlbnRlckJ1dHRvbl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwYXNzd29yZE9ubHkgPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQQVNTV09SRF9BVVRIX09OTFknKTtcbiAgICAgICAgdmFyIHNlY3VyZUxvZ2luRm9ybSA9IHBhc3N3b3JkT25seSB8fCB0aGlzLnN0YXRlLmF1dGhQYXJhbWV0ZXJzLmdldCgnU0VDVVJFX0xPR0lOX0ZPUk0nKTtcbiAgICAgICAgdmFyIGZvcmdvdFBhc3N3b3JkTGluayA9IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdFTkFCTEVfRk9SR09UX1BBU1NXT1JEJykgJiYgIXBhc3N3b3JkT25seTtcblxuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcklkKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnYWp4cF9sb2dpbl9lcnJvcicgfSxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmVycm9ySWRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvcmdvdExpbmsgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChmb3Jnb3RQYXNzd29yZExpbmspIHtcbiAgICAgICAgICAgIGZvcmdvdExpbmsgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZm9yZ290LXBhc3N3b3JkLWxpbmsnIH0sXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IHRoaXMuZmlyZUZvcmdvdFBhc3N3b3JkIH0sXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWzQ3OV1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBzID0geyB0b3A6IFtdLCBib3R0b206IFtdIH07XG4gICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm1vZGlmaWVycy5tYXAoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHModGhpcy5wcm9wcywgdGhpcy5zdGF0ZSwgY29tcHMpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBzLnRvcC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNUb3AgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMudG9wXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wcy5ib3R0b20ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLmJvdHRvbVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY3VzdG9tID0gdGhpcy5wcm9wcy5weWRpby5QYXJhbWV0ZXJzLmdldCgnY3VzdG9tV29yZGluZycpO1xuICAgICAgICB2YXIgbG9nb1VybCA9IGN1c3RvbS5pY29uO1xuICAgICAgICBpZiAoY3VzdG9tLmljb25CaW5hcnkpIHtcbiAgICAgICAgICAgIGxvZ29VcmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIFwiL2Zyb250ZW5kL2JpbmFyaWVzL0dMT0JBTC9cIiArIGN1c3RvbS5pY29uQmluYXJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvZ29TdHlsZSA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRTaXplOiAnY29udGFpbicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIGxvZ29VcmwgKyAnKScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246ICdjZW50ZXInLFxuICAgICAgICAgICAgYmFja2dyb3VuZFJlcGVhdDogJ25vLXJlcGVhdCcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogLTEzMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB3aWR0aDogMzIwLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMjBcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGFuZ3VhZ2VzID0gW107XG4gICAgICAgIHB5ZGlvLmxpc3RMYW5ndWFnZXNXaXRoQ2FsbGJhY2soZnVuY3Rpb24gKGtleSwgbGFiZWwsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGxhbmd1YWdlcy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgcHJpbWFyeVRleHQ6IGxhYmVsLCB2YWx1ZToga2V5LCByaWdodEljb246IGN1cnJlbnQgPyBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktY2hlY2snIH0pIDogbnVsbCB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGFuZ3VhZ2VNZW51ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9tYXRlcmlhbFVpLkljb25NZW51LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGljb25CdXR0b25FbGVtZW50OiBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgdG9vbHRpcDogcHlkaW8uTWVzc2FnZUhhc2hbNjE4XSwgaWNvbkNsYXNzTmFtZTogJ21kaSBtZGktZmxhZy1vdXRsaW5lLXZhcmlhbnQnLCBpY29uU3R5bGU6IHsgZm9udFNpemU6IDIwLCBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsLjY3KScgfSB9KSxcbiAgICAgICAgICAgICAgICBvbkl0ZW1Ub3VjaFRhcDogZnVuY3Rpb24gKGUsIG8pIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8ubG9hZEkxOE5NZXNzYWdlcyhvLnByb3BzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2t0b3A6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYW5ndWFnZXNcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIERhcmtUaGVtZUNvbnRhaW5lcixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBsb2dvVXJsICYmIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHsgc3R5bGU6IGxvZ29TdHlsZSB9KSxcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdkaWFsb2dMZWdlbmQnLCBzdHlsZTogeyBmb250U2l6ZTogMjIsIHBhZGRpbmdCb3R0b206IDEyLCBsaW5lSGVpZ2h0OiAnMjhweCcgfSB9LFxuICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoW3Bhc3N3b3JkT25seSA/IDU1MiA6IDE4MF0sXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2VNZW51XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNUb3AsXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdmb3JtJyxcbiAgICAgICAgICAgICAgICB7IGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIiB9LFxuICAgICAgICAgICAgICAgICFwYXNzd29yZE9ubHkgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIixcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE4MV0sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLnN1Ym1pdE9uRW50ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbi1sb2dpbidcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2FwcGxpY2F0aW9uLXBhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIixcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE4Ml0sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLnN1Ym1pdE9uRW50ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNCb3R0b20sXG4gICAgICAgICAgICBmb3Jnb3RMaW5rXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxudmFyIERhcmtUaGVtZUNvbnRhaW5lciA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEYXJrVGhlbWVDb250YWluZXIsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRGFya1RoZW1lQ29udGFpbmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGFya1RoZW1lQ29udGFpbmVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEYXJrVGhlbWVDb250YWluZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRGFya1RoZW1lQ29udGFpbmVyLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbXVpVGhlbWUgPSBfcHJvcHMubXVpVGhlbWU7XG5cbiAgICAgICAgICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcHJvcHMsIFsnbXVpVGhlbWUnXSk7XG5cbiAgICAgICAgICAgIHZhciBiYXNlVGhlbWUgPSBfZXh0ZW5kcyh7fSwgX21hdGVyaWFsVWlTdHlsZXMuZGFya0Jhc2VUaGVtZSk7XG4gICAgICAgICAgICBiYXNlVGhlbWUucGFsZXR0ZS5wcmltYXJ5MUNvbG9yID0gbXVpVGhlbWUucGFsZXR0ZS5hY2NlbnQxQ29sb3I7XG4gICAgICAgICAgICB2YXIgZGFya1RoZW1lID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLmdldE11aVRoZW1lKShiYXNlVGhlbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5NdWlUaGVtZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHsgbXVpVGhlbWU6IGRhcmtUaGVtZSB9LFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHByb3BzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEYXJrVGhlbWVDb250YWluZXI7XG59KShSZWFjdC5Db21wb25lbnQpO1xuXG5EYXJrVGhlbWVDb250YWluZXIgPSAoMCwgX21hdGVyaWFsVWlTdHlsZXMubXVpVGhlbWVhYmxlKSgpKERhcmtUaGVtZUNvbnRhaW5lcik7XG5cbnZhciBNdWx0aUF1dGhTZWxlY3RvciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ011bHRpQXV0aFNlbGVjdG9yJyxcblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsdWU7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogT2JqZWN0LmtleXModGhpcy5wcm9wcy5hdXRoU291cmNlcykuc2hpZnQoKSB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2Uob2JqZWN0LCBrZXksIHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBwYXlsb2FkIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wcy5hdXRoU291cmNlcykge1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goUmVhY3QuY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwgeyB2YWx1ZToga2V5LCBwcmltYXJ5VGV4dDogdGhpcy5wcm9wcy5hdXRoU291cmNlc1trZXldIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIF9tYXRlcmlhbFVpLlNlbGVjdEZpZWxkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiAnTG9naW4gYXMuLi4nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVudUl0ZW1zXG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbnZhciBNdWx0aUF1dGhNb2RpZmllciA9IChmdW5jdGlvbiAoX1B5ZGlvUmVhY3RVSSRBYnN0cmFjdERpYWxvZ01vZGlmaWVyKSB7XG4gICAgX2luaGVyaXRzKE11bHRpQXV0aE1vZGlmaWVyLCBfUHlkaW9SZWFjdFVJJEFic3RyYWN0RGlhbG9nTW9kaWZpZXIpO1xuXG4gICAgZnVuY3Rpb24gTXVsdGlBdXRoTW9kaWZpZXIoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNdWx0aUF1dGhNb2RpZmllcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTXVsdGlBdXRoTW9kaWZpZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoTXVsdGlBdXRoTW9kaWZpZXIsIFt7XG4gICAgICAgIGtleTogJ2VucmljaFN1Ym1pdFBhcmFtZXRlcnMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZW5yaWNoU3VibWl0UGFyYW1ldGVycyhwcm9wcywgc3RhdGUsIHJlZnMsIHBhcmFtcykge1xuXG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRTb3VyY2UgPSByZWZzLm11bHRpX3NlbGVjdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICBwYXJhbXNbJ2F1dGhfc291cmNlJ10gPSBzZWxlY3RlZFNvdXJjZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5tYXN0ZXJBdXRoU291cmNlICYmIHNlbGVjdGVkU291cmNlID09PSBwcm9wcy5tYXN0ZXJBdXRoU291cmNlKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zWyd1c2VyaWQnXSA9IHNlbGVjdGVkU291cmNlICsgcHJvcHMudXNlcklkU2VwYXJhdG9yICsgcGFyYW1zWyd1c2VyaWQnXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHMocHJvcHMsIHN0YXRlLCBhY2N1bXVsYXRvcikge1xuXG4gICAgICAgICAgICBpZiAoIXByb3BzLmF1dGhTb3VyY2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IGZpbmQgYXV0aFNvdXJjZXMnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY2N1bXVsYXRvci50b3AucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KE11bHRpQXV0aFNlbGVjdG9yLCBfZXh0ZW5kcyh7IHJlZjogJ211bHRpX3NlbGVjdG9yJyB9LCBwcm9wcywgeyBwYXJlbnRTdGF0ZTogc3RhdGUgfSkpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNdWx0aUF1dGhNb2RpZmllcjtcbn0pKFB5ZGlvUmVhY3RVSS5BYnN0cmFjdERpYWxvZ01vZGlmaWVyKTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdzZXNzaW9uTG9nb3V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlc3Npb25Mb2dvdXQoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhFUkUgV0UgQVJFXCIpO1xuXG4gICAgICAgICAgICBpZiAoUHlkaW8uZ2V0SW5zdGFuY2UoKS5QYXJhbWV0ZXJzLmdldChcIlBSRUxPR19VU0VSXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKS5zZXNzaW9uTG9nb3V0KClbJ2ZpbmFsbHknXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdGUk9OVEVORF9VUkwnKSArICcvbG9nb3V0JztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdsb2dpblBhc3N3b3JkJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvZ2luUGFzc3dvcmQoKSB7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICAgICAgaWYgKFB5ZGlvLmdldEluc3RhbmNlKCkuUGFyYW1ldGVycy5nZXQoXCJQUkVMT0dfVVNFUlwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ0xvZ2luUGFzc3dvcmREaWFsb2cnLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHsgYmx1cjogdHJ1ZSB9KSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxudmFyIFJlc2V0UGFzc3dvcmRSZXF1aXJlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUmVzZXRQYXNzd29yZFJlcXVpcmUnLFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgcHlkaW8uVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ1Jlc2V0UGFzc3dvcmRSZXF1aXJlJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICB1c2VCbHVyOiBmdW5jdGlvbiB1c2VCbHVyKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgIHB5ZGlvLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignbG9naW4nKTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucmVmcy5pbnB1dCAmJiB0aGlzLnJlZnMuaW5wdXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5Ub2tlblNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICBhcGkucmVzZXRQYXNzd29yZFRva2VuKHZhbHVlKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IHZhbHVlU3VibWl0dGVkOiB0cnVlIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIHZhbHVlU3VibWl0dGVkID0gdGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLnZhbHVlU3VibWl0dGVkO1xuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICF2YWx1ZVN1Ym1pdHRlZCAmJiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZGlhbG9nTGVnZW5kJyB9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzWydndWkudXNlci4zJ11cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdmFsdWVTdWJtaXR0ZWQgJiYgUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjUnXVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBSZXNldFBhc3N3b3JkRGlhbG9nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnUmVzZXRQYXNzd29yZERpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdSZXNldFBhc3N3b3JkRGlhbG9nJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IHB5ZGlvLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWVTdWJtaXR0ZWQ6IGZhbHNlLCBmb3JtTG9hZGVkOiBmYWxzZSwgcGFzc1ZhbHVlOiBudWxsLCB1c2VySWQ6IG51bGwgfTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRlJPTlRFTkRfVVJMJykgKyAnL2xvZ2luJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtZXNzID0gcHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuVG9rZW5TZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuUmVzdFJlc2V0UGFzc3dvcmRSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3QuVXNlckxvZ2luID0gdGhpcy5zdGF0ZS51c2VySWQ7XG4gICAgICAgIHJlcXVlc3QuUmVzZXRQYXNzd29yZFRva2VuID0gcHlkaW8uUGFyYW1ldGVycy5nZXQoJ1VTRVJfQUNUSU9OX0tFWScpO1xuICAgICAgICByZXF1ZXN0Lk5ld1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS5wYXNzVmFsdWU7XG4gICAgICAgIGFwaS5yZXNldFBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM1LnNldFN0YXRlKHsgdmFsdWVTdWJtaXR0ZWQ6IHRydWUgfSk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBhbGVydChtZXNzWzI0MF0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgICBQcm9taXNlLnJlc29sdmUocmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdmb3JtJywgdHJ1ZSkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM2LnNldFN0YXRlKHsgZm9ybUxvYWRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUGFzc0NoYW5nZTogZnVuY3Rpb24gb25QYXNzQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFzc1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgb25Vc2VySWRDaGFuZ2U6IGZ1bmN0aW9uIG9uVXNlcklkQ2hhbmdlKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcklkOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IF9zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgdmFyIGZvcm1Mb2FkZWQgPSBfc3RhdGUuZm9ybUxvYWRlZDtcbiAgICAgICAgdmFyIHBhc3NWYWx1ZSA9IF9zdGF0ZS5wYXNzVmFsdWU7XG4gICAgICAgIHZhciB1c2VySWQgPSBfc3RhdGUudXNlcklkO1xuXG4gICAgICAgIGlmICghdmFsdWVTdWJtaXR0ZWQgJiYgZm9ybUxvYWRlZCkge1xuXG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuOCddXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Vc2VySWRDaGFuZ2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9Gb3JtLlZhbGlkUGFzc3dvcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uUGFzc0NoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IG5hbWU6ICdwYXNzd29yZCcsIGxhYmVsOiBtZXNzWzE5OF0gfSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBhc3NWYWx1ZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuNiddXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHlkaW9SZWFjdFVJLkxvYWRlciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzLkNhbGxiYWNrcyA9IENhbGxiYWNrcztcbmV4cG9ydHMuTG9naW5QYXNzd29yZERpYWxvZyA9IExvZ2luUGFzc3dvcmREaWFsb2c7XG5leHBvcnRzLlJlc2V0UGFzc3dvcmRSZXF1aXJlID0gUmVzZXRQYXNzd29yZFJlcXVpcmU7XG5leHBvcnRzLlJlc2V0UGFzc3dvcmREaWFsb2cgPSBSZXNldFBhc3N3b3JkRGlhbG9nO1xuZXhwb3J0cy5NdWx0aUF1dGhNb2RpZmllciA9IE11bHRpQXV0aE1vZGlmaWVyO1xuIl19
