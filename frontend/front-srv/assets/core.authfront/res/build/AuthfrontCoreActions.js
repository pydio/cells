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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInJlcy9idWlsZC9Db3JlQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKG9iaiwga2V5cykgeyB2YXIgdGFyZ2V0ID0ge307IGZvciAodmFyIGkgaW4gb2JqKSB7IGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7IGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaSkpIGNvbnRpbnVlOyB0YXJnZXRbaV0gPSBvYmpbaV07IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZShcInB5ZGlvL2h0dHAvYXBpXCIpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX2NyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVJlYWN0Q2xhc3MpO1xuXG52YXIgX21hdGVyaWFsVWlTdHlsZXMgPSByZXF1aXJlKCdtYXRlcmlhbC11aS9zdHlsZXMnKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgTGFuZ3VhZ2VQaWNrZXIgPSBmdW5jdGlvbiBMYW5ndWFnZVBpY2tlcihwcm9wcykge1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHZhciBweWRpbyA9IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpO1xuXG4gICAgcHlkaW8ubGlzdExhbmd1YWdlc1dpdGhDYWxsYmFjayhmdW5jdGlvbiAoa2V5LCBsYWJlbCwgY3VycmVudCkge1xuICAgICAgICByZXR1cm4gaXRlbXMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5NZW51SXRlbSwge1xuICAgICAgICAgICAgcHJpbWFyeVRleHQ6IGxhYmVsLFxuICAgICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICAgIHJpZ2h0SWNvbjogY3VycmVudCA/IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogJ21kaSBtZGktY2hlY2snIH0pIDogbnVsbFxuICAgICAgICB9KSk7XG4gICAgfSk7XG4gICAgdmFyIGFuY2hvck9yaWdpbiA9IHByb3BzLmFuY2hvck9yaWdpbjtcbiAgICB2YXIgdGFyZ2V0T3JpZ2luID0gcHJvcHMudGFyZ2V0T3JpZ2luO1xuXG4gICAgdmFyIGljb25TdHlsZXMgPSB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICB3aWR0aDogMzgsXG4gICAgICAgICAgICBoZWlnaHQ6IDM4LFxuICAgICAgICAgICAgcGFkZGluZzogNixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzUwJSdcbiAgICAgICAgfSxcbiAgICAgICAgaG92ZXJlZFN0eWxlOiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LC4xKSdcbiAgICAgICAgfSxcbiAgICAgICAgaWNvblN0eWxlOiB7XG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsLjg3KSdcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIF9tYXRlcmlhbFVpLkljb25NZW51LFxuICAgICAgICB7XG4gICAgICAgICAgICBpY29uQnV0dG9uRWxlbWVudDogX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgX2V4dGVuZHMoeyB0b29sdGlwOiBweWRpby5NZXNzYWdlSGFzaFs2MThdLCBpY29uQ2xhc3NOYW1lOiAnbWRpIG1kaS1mbGFnLW91dGxpbmUnIH0sIGljb25TdHlsZXMpKSxcbiAgICAgICAgICAgIG9uSXRlbVRvdWNoVGFwOiBmdW5jdGlvbiAoZSwgbykge1xuICAgICAgICAgICAgICAgIHB5ZGlvLmxvYWRJMThOTWVzc2FnZXMoby5wcm9wcy52YWx1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVza3RvcDogdHJ1ZSxcbiAgICAgICAgICAgIGFuY2hvck9yaWdpbjogYW5jaG9yT3JpZ2luLCB0YXJnZXRPcmlnaW46IHRhcmdldE9yaWdpblxuICAgICAgICB9LFxuICAgICAgICBpdGVtc1xuICAgICk7XG59O1xuXG52YXIgTG9naW5EaWFsb2dNaXhpbiA9IHtcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2xvYmFsUGFyYW1ldGVyczogcHlkaW8uUGFyYW1ldGVycyxcbiAgICAgICAgICAgIGF1dGhQYXJhbWV0ZXJzOiBweWRpby5nZXRQbHVnaW5Db25maWdzKCdhdXRoJyksXG4gICAgICAgICAgICBlcnJvcklkOiBudWxsLFxuICAgICAgICAgICAgZGlzcGxheUNhcHRjaGE6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHBvc3RMb2dpbkRhdGE6IGZ1bmN0aW9uIHBvc3RMb2dpbkRhdGEocmVzdENsaWVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBweWRpbyA9IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpO1xuICAgICAgICB2YXIgcGFzc3dvcmRPbmx5ID0gdGhpcy5zdGF0ZS5nbG9iYWxQYXJhbWV0ZXJzLmdldCgnUEFTU1dPUkRfQVVUSF9PTkxZJyk7XG4gICAgICAgIHZhciBsb2dpbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHBhc3N3b3JkT25seSkge1xuICAgICAgICAgICAgbG9naW4gPSB0aGlzLnN0YXRlLmdsb2JhbFBhcmFtZXRlcnMuZ2V0KCdQUkVTRVRfTE9HSU4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2luID0gdGhpcy5yZWZzLmxvZ2luLmdldFZhbHVlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN0Q2xpZW50LnNlc3Npb25Mb2dpbldpdGhDcmVkZW50aWFscyhsb2dpbiwgdGhpcy5yZWZzLnBhc3N3b3JkLmdldFZhbHVlKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmRpc21pc3MoKTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdENsaWVudC5nZXRPclVwZGF0ZUp3dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5sb2FkWG1sUmVnaXN0cnkobnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7fSk7XG4gICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoZSAmJiBlLnJlc3BvbnNlICYmIGUucmVzcG9uc2UuYm9keSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogZS5yZXNwb25zZS5ib2R5LlRpdGxlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlICYmIGUucmVzcG9uc2UgJiYgZS5yZXNwb25zZS50ZXh0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcklkOiBlLnJlc3BvbnNlLnRleHQgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgJiYgZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc2V0U3RhdGUoeyBlcnJvcklkOiBlLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLnNldFN0YXRlKHsgZXJyb3JJZDogJ0xvZ2luIGZhaWxlZCEnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG52YXIgTG9naW5QYXNzd29yZERpYWxvZyA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiwgTG9naW5EaWFsb2dNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJywgLy9weWRpby5NZXNzYWdlSGFzaFsxNjNdLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogdHJ1ZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdzbSdcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB7IHJlbWVtYmVyQ2hlY2tlZDogZmFsc2UgfTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBjbGllbnQgPSBfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKTtcbiAgICAgICAgdGhpcy5wb3N0TG9naW5EYXRhKGNsaWVudCk7XG4gICAgfSxcblxuICAgIGZpcmVGb3Jnb3RQYXNzd29yZDogZnVuY3Rpb24gZmlyZUZvcmdvdFBhc3N3b3JkKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24odGhpcy5zdGF0ZS5hdXRoUGFyYW1ldGVycy5nZXQoXCJGT1JHT1RfUEFTU1dPUkRfQUNUSU9OXCIpKTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGRpYWxvZ0JvZHlTdHlsZTogZnVuY3Rpb24gZGlhbG9nQm9keVN0eWxlKCkge1xuICAgICAgICByZXR1cm4geyBtaW5IZWlnaHQ6IDI1MCB9O1xuICAgIH0sXG5cbiAgICBnZXRCdXR0b25zOiBmdW5jdGlvbiBnZXRCdXR0b25zKCkge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgc2VjdXJlTG9naW5Gb3JtID0gcGFzc3dvcmRPbmx5IHx8IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdTRUNVUkVfTE9HSU5fRk9STScpO1xuXG4gICAgICAgIHZhciBlbnRlckJ1dHRvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgaWQ6ICdkaWFsb2ctbG9naW4tc3VibWl0JywgJ2RlZmF1bHQnOiB0cnVlLCBsYWJlbFN0eWxlOiB7IGNvbG9yOiAnd2hpdGUnIH0sIGtleTogJ2VudGVyJywgbGFiZWw6IHB5ZGlvLk1lc3NhZ2VIYXNoWzYxN10sIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLnN1Ym1pdCgpO1xuICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgdmFyIGJ1dHRvbnMgPSBbXTtcbiAgICAgICAgaWYgKGZhbHNlICYmICFzZWN1cmVMb2dpbkZvcm0pIHtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBEYXJrVGhlbWVDb250YWluZXIsXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdyZW1lbWJlcicsIHN0eWxlOiB7IGZsZXg6IDEsIHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nTGVmdDogMTYgfSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkNoZWNrYm94LCB7IGxhYmVsOiBweWRpby5NZXNzYWdlSGFzaFsyNjFdLCBsYWJlbFN0eWxlOiB7IGZvbnRTaXplOiAxMyB9LCBvbkNoZWNrOiBmdW5jdGlvbiAoZSwgYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcmVtZW1iZXJDaGVja2VkOiBjIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICApKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChlbnRlckJ1dHRvbik7XG4gICAgICAgICAgICByZXR1cm4gW19yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9IH0sXG4gICAgICAgICAgICAgICAgYnV0dG9uc1xuICAgICAgICAgICAgKV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW2VudGVyQnV0dG9uXTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHBhc3N3b3JkT25seSA9IHRoaXMuc3RhdGUuZ2xvYmFsUGFyYW1ldGVycy5nZXQoJ1BBU1NXT1JEX0FVVEhfT05MWScpO1xuICAgICAgICB2YXIgc2VjdXJlTG9naW5Gb3JtID0gcGFzc3dvcmRPbmx5IHx8IHRoaXMuc3RhdGUuYXV0aFBhcmFtZXRlcnMuZ2V0KCdTRUNVUkVfTE9HSU5fRk9STScpO1xuICAgICAgICB2YXIgZm9yZ290UGFzc3dvcmRMaW5rID0gdGhpcy5zdGF0ZS5hdXRoUGFyYW1ldGVycy5nZXQoJ0VOQUJMRV9GT1JHT1RfUEFTU1dPUkQnKSAmJiAhcGFzc3dvcmRPbmx5O1xuICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcblxuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcklkKSB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2FqeHBfbG9naW5fZXJyb3InIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5lcnJvcklkXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmb3Jnb3RMaW5rID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoZm9yZ290UGFzc3dvcmRMaW5rKSB7XG4gICAgICAgICAgICBmb3Jnb3RMaW5rID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICdmb3Jnb3QtcGFzc3dvcmQtbGluaycgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2EnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInIH0sIG9uQ2xpY2s6IHRoaXMuZmlyZUZvcmdvdFBhc3N3b3JkIH0sXG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLk1lc3NhZ2VIYXNoWzQ3OV1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhZGRpdGlvbmFsQ29tcG9uZW50c1RvcCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5tb2RpZmllcnMpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbXBzID0geyB0b3A6IFtdLCBib3R0b206IFtdIH07XG4gICAgICAgICAgICAgICAgX3RoaXMzLnByb3BzLm1vZGlmaWVycy5tYXAoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVuZGVyQWRkaXRpb25hbENvbXBvbmVudHModGhpcy5wcm9wcywgdGhpcy5zdGF0ZSwgY29tcHMpO1xuICAgICAgICAgICAgICAgIH0pLmJpbmQoX3RoaXMzKSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBzLnRvcC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbENvbXBvbmVudHNUb3AgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBzLnRvcFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcHMuYm90dG9tLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQ29tcG9uZW50c0JvdHRvbSA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcHMuYm90dG9tXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjdXN0b20gPSB0aGlzLnByb3BzLnB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdjdXN0b21Xb3JkaW5nJyk7XG4gICAgICAgIHZhciBsb2dvVXJsID0gY3VzdG9tLmljb247XG4gICAgICAgIHZhciBsb2dpblRpdGxlID0gcHlkaW8uTWVzc2FnZUhhc2hbcGFzc3dvcmRPbmx5ID8gNTUyIDogMTgwXTtcbiAgICAgICAgdmFyIGxvZ2luTGVnZW5kID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoY3VzdG9tLmljb25CaW5hcnkpIHtcbiAgICAgICAgICAgIGxvZ29VcmwgPSBweWRpby5QYXJhbWV0ZXJzLmdldCgnRU5EUE9JTlRfUkVTVF9BUEknKSArIFwiL2Zyb250ZW5kL2JpbmFyaWVzL0dMT0JBTC9cIiArIGN1c3RvbS5pY29uQmluYXJ5O1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFzc3dvcmRPbmx5KSB7XG4gICAgICAgICAgICBpZiAoY3VzdG9tLmxvZ2luVGl0bGUpIHtcbiAgICAgICAgICAgICAgICBsb2dpblRpdGxlID0gY3VzdG9tLmxvZ2luVGl0bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3VzdG9tLmxvZ2luTGVnZW5kKSB7XG4gICAgICAgICAgICAgICAgbG9naW5MZWdlbmQgPSBjdXN0b20ubG9naW5MZWdlbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nb1N0eWxlID0ge1xuICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6ICdjb250YWluJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgbG9nb1VybCArICcpJyxcbiAgICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvbjogJ2NlbnRlcicsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kUmVwZWF0OiAnbm8tcmVwZWF0JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgdG9wOiAtMTMwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHdpZHRoOiAzMjAsXG4gICAgICAgICAgICBoZWlnaHQ6IDEyMFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgIERhcmtUaGVtZUNvbnRhaW5lcixcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICBsb2dvVXJsICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KCdkaXYnLCB7IHN0eWxlOiBsb2dvU3R5bGUgfSksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcsIHN0eWxlOiB7IGZvbnRTaXplOiAyMiwgcGFkZGluZ0JvdHRvbTogMTIsIGxpbmVIZWlnaHQ6ICcyOHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgbG9naW5UaXRsZSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJvdHRvbTogOSwgbGVmdDogMjQgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChMYW5ndWFnZVBpY2tlciwgeyBhbmNob3JPcmlnaW46IHsgaG9yaXpvbnRhbDogJ2xlZnQnLCB2ZXJ0aWNhbDogJ2JvdHRvbScgfSwgdGFyZ2V0T3JpZ2luOiB7IGhvcml6b250YWw6ICdsZWZ0JywgdmVydGljYWw6ICdib3R0b20nIH0gfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbG9naW5MZWdlbmQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBsb2dpbkxlZ2VuZFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzVG9wLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2Zvcm0nLFxuICAgICAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlOiBzZWN1cmVMb2dpbkZvcm0gPyBcIm9mZlwiIDogXCJvblwiIH0sXG4gICAgICAgICAgICAgICAgIXBhc3N3b3JkT25seSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogc2VjdXJlTG9naW5Gb3JtID8gXCJvZmZcIiA6IFwib25cIixcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHB5ZGlvLk1lc3NhZ2VIYXNoWzE4MV0sXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLnN1Ym1pdE9uRW50ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbi1sb2dpbidcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbi1wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU6IHNlY3VyZUxvZ2luRm9ybSA/IFwib2ZmXCIgOiBcIm9uXCIsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiBweWRpby5NZXNzYWdlSGFzaFsxODJdLFxuICAgICAgICAgICAgICAgICAgICByZWY6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5zdWJtaXRPbkVudGVyS2V5LFxuICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWVcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGFkZGl0aW9uYWxDb21wb25lbnRzQm90dG9tLFxuICAgICAgICAgICAgZm9yZ290TGlua1xuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBEYXJrVGhlbWVDb250YWluZXIgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRGFya1RoZW1lQ29udGFpbmVyLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERhcmtUaGVtZUNvbnRhaW5lcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERhcmtUaGVtZUNvbnRhaW5lcik7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGFya1RoZW1lQ29udGFpbmVyLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERhcmtUaGVtZUNvbnRhaW5lciwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIG11aVRoZW1lID0gX3Byb3BzLm11aVRoZW1lO1xuXG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Byb3BzLCBbJ211aVRoZW1lJ10pO1xuXG4gICAgICAgICAgICB2YXIgYmFzZVRoZW1lID0gX2V4dGVuZHMoe30sIF9tYXRlcmlhbFVpU3R5bGVzLmRhcmtCYXNlVGhlbWUpO1xuICAgICAgICAgICAgYmFzZVRoZW1lLnBhbGV0dGUucHJpbWFyeTFDb2xvciA9IG11aVRoZW1lLnBhbGV0dGUuYWNjZW50MUNvbG9yO1xuICAgICAgICAgICAgdmFyIGRhcmtUaGVtZSA9ICgwLCBfbWF0ZXJpYWxVaVN0eWxlcy5nZXRNdWlUaGVtZSkoYmFzZVRoZW1lKTtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLk11aVRoZW1lUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgeyBtdWlUaGVtZTogZGFya1RoZW1lIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHByb3BzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEYXJrVGhlbWVDb250YWluZXI7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxuRGFya1RoZW1lQ29udGFpbmVyID0gKDAsIF9tYXRlcmlhbFVpU3R5bGVzLm11aVRoZW1lYWJsZSkoKShEYXJrVGhlbWVDb250YWluZXIpO1xuXG52YXIgTXVsdGlBdXRoU2VsZWN0b3IgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsdWU7XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogT2JqZWN0LmtleXModGhpcy5wcm9wcy5hdXRoU291cmNlcykuc2hpZnQoKSB9O1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gb25DaGFuZ2Uob2JqZWN0LCBrZXksIHBheWxvYWQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiBwYXlsb2FkIH0pO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIG1lbnVJdGVtcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5wcm9wcy5hdXRoU291cmNlcykge1xuICAgICAgICAgICAgbWVudUl0ZW1zLnB1c2goX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuTWVudUl0ZW0sIHsgdmFsdWU6IGtleSwgcHJpbWFyeVRleHQ6IHRoaXMucHJvcHMuYXV0aFNvdXJjZXNba2V5XSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgX21hdGVyaWFsVWkuU2VsZWN0RmllbGQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUudmFsdWUsXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6ICdMb2dpbiBhcy4uLidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZW51SXRlbXNcbiAgICAgICAgKTtcbiAgICB9XG59KTtcblxudmFyIE11bHRpQXV0aE1vZGlmaWVyID0gKGZ1bmN0aW9uIChfUHlkaW9SZWFjdFVJJEFic3RyYWN0RGlhbG9nTW9kaWZpZXIpIHtcbiAgICBfaW5oZXJpdHMoTXVsdGlBdXRoTW9kaWZpZXIsIF9QeWRpb1JlYWN0VUkkQWJzdHJhY3REaWFsb2dNb2RpZmllcik7XG5cbiAgICBmdW5jdGlvbiBNdWx0aUF1dGhNb2RpZmllcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE11bHRpQXV0aE1vZGlmaWVyKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihNdWx0aUF1dGhNb2RpZmllci5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNdWx0aUF1dGhNb2RpZmllciwgW3tcbiAgICAgICAga2V5OiAnZW5yaWNoU3VibWl0UGFyYW1ldGVycycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBlbnJpY2hTdWJtaXRQYXJhbWV0ZXJzKHByb3BzLCBzdGF0ZSwgcmVmcywgcGFyYW1zKSB7XG5cbiAgICAgICAgICAgIHZhciBzZWxlY3RlZFNvdXJjZSA9IHJlZnMubXVsdGlfc2VsZWN0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHBhcmFtc1snYXV0aF9zb3VyY2UnXSA9IHNlbGVjdGVkU291cmNlO1xuICAgICAgICAgICAgaWYgKHByb3BzLm1hc3RlckF1dGhTb3VyY2UgJiYgc2VsZWN0ZWRTb3VyY2UgPT09IHByb3BzLm1hc3RlckF1dGhTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbJ3VzZXJpZCddID0gc2VsZWN0ZWRTb3VyY2UgKyBwcm9wcy51c2VySWRTZXBhcmF0b3IgKyBwYXJhbXNbJ3VzZXJpZCddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXJBZGRpdGlvbmFsQ29tcG9uZW50cycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXJBZGRpdGlvbmFsQ29tcG9uZW50cyhwcm9wcywgc3RhdGUsIGFjY3VtdWxhdG9yKSB7XG5cbiAgICAgICAgICAgIGlmICghcHJvcHMuYXV0aFNvdXJjZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZmluZCBhdXRoU291cmNlcycpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFjY3VtdWxhdG9yLnRvcC5wdXNoKF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE11bHRpQXV0aFNlbGVjdG9yLCBfZXh0ZW5kcyh7IHJlZjogJ211bHRpX3NlbGVjdG9yJyB9LCBwcm9wcywgeyBwYXJlbnRTdGF0ZTogc3RhdGUgfSkpKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNdWx0aUF1dGhNb2RpZmllcjtcbn0pKFB5ZGlvUmVhY3RVSS5BYnN0cmFjdERpYWxvZ01vZGlmaWVyKTtcblxudmFyIENhbGxiYWNrcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FsbGJhY2tzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FsbGJhY2tzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoQ2FsbGJhY2tzLCBudWxsLCBbe1xuICAgICAgICBrZXk6ICdzZXNzaW9uTG9nb3V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNlc3Npb25Mb2dvdXQoKSB7XG5cbiAgICAgICAgICAgIHZhciBweWRpbyA9IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgICAgICBpZiAocHlkaW8uUGFyYW1ldGVycy5nZXQoXCJQUkVMT0dfVVNFUlwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB1cmwgPSBweWRpby5nZXRGcm9udGVuZFVybCgpO1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHVybC5wcm90b2NvbCArICcvLycgKyB1cmwuaG9zdCArICcvbG9nb3V0JztcblxuICAgICAgICAgICAgX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkuc2Vzc2lvbkxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5sb2FkWG1sUmVnaXN0cnkobnVsbCwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdGFyZ2V0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2xvZ2luUGFzc3dvcmQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gbG9naW5QYXNzd29yZChtYW5hZ2VyKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IFtdIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB2YXIgcHlkaW8gPSBfcHlkaW8yWydkZWZhdWx0J10uZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIGlmIChweWRpby5QYXJhbWV0ZXJzLmdldChcIlBSRUxPR19VU0VSXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgX3JlZiA9IGFyZ3NbMF0gfHwge307XG5cbiAgICAgICAgICAgIHZhciBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVmLCBbXSk7XG5cbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdMb2dpblBhc3N3b3JkRGlhbG9nJywgX2V4dGVuZHMoe30sIHByb3BzLCB7IGJsdXI6IHRydWUgfSkpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENhbGxiYWNrcztcbn0pKCk7XG5cbnZhciBSZXNldFBhc3N3b3JkUmVxdWlyZSA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVJLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VUkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbiwgUHlkaW9SZWFjdFVJLkNhbmNlbEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgc3RhdGljczoge1xuICAgICAgICBvcGVuOiBmdW5jdGlvbiBvcGVuKCkge1xuICAgICAgICAgICAgX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKCkuVUkub3BlbkNvbXBvbmVudEluTW9kYWwoJ0F1dGhmcm9udENvcmVBY3Rpb25zJywgJ1Jlc2V0UGFzc3dvcmRSZXF1aXJlJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICB1c2VCbHVyOiBmdW5jdGlvbiB1c2VCbHVyKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLkNvbnRyb2xsZXIuZmlyZUFjdGlvbignbG9naW4nKTtcbiAgICB9LFxuXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgaWYgKHZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMucmVmcy5pbnB1dCAmJiB0aGlzLnJlZnMuaW5wdXQuZ2V0VmFsdWUoKTtcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVG9rZW5TZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgYXBpLnJlc2V0UGFzc3dvcmRUb2tlbih2YWx1ZSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyB2YWx1ZVN1Ym1pdHRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgbWVzcyA9IHRoaXMucHJvcHMucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgIXZhbHVlU3VibWl0dGVkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ2RpYWxvZ0xlZ2VuZCcgfSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuMyddXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYmx1ckRpYWxvZ1RleHRGaWVsZCcsXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2lucHV0JyxcbiAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogbWVzc1snZ3VpLnVzZXIuNCddXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICB2YWx1ZVN1Ym1pdHRlZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG1lc3NbJ2d1aS51c2VyLjUnXVxuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbnZhciBSZXNldFBhc3N3b3JkRGlhbG9nID0gKDAsIF9jcmVhdGVSZWFjdENsYXNzMlsnZGVmYXVsdCddKSh7XG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VUkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVSS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIHN0YXRpY3M6IHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24gb3BlbigpIHtcbiAgICAgICAgICAgIF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdBdXRoZnJvbnRDb3JlQWN0aW9ucycsICdSZXNldFBhc3N3b3JkRGlhbG9nJywgeyBibHVyOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpLk1lc3NhZ2VIYXNoWydndWkudXNlci4xJ10sXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiB0cnVlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ3NtJ1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWVTdWJtaXR0ZWQ6IGZhbHNlLCBmb3JtTG9hZGVkOiBmYWxzZSwgcGFzc1ZhbHVlOiBudWxsLCB1c2VySWQ6IG51bGwgfTtcbiAgICB9LFxuXG4gICAgdXNlQmx1cjogZnVuY3Rpb24gdXNlQmx1cigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB2YXIgX3RoaXM1ID0gdGhpcztcblxuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLnByb3BzLnB5ZGlvO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlU3VibWl0dGVkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRGlzbWlzcygpO1xuICAgICAgICAgICAgdmFyIHVybCA9IHB5ZGlvLmdldEZyb250ZW5kVXJsKCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybC5wcm90b2NvbCArICcvLycgKyB1cmwuaG9zdCArICcvbG9naW4nO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1lc3MgPSBweWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuVG9rZW5TZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgX2NlbGxzU2RrLlJlc3RSZXNldFBhc3N3b3JkUmVxdWVzdCgpO1xuICAgICAgICByZXF1ZXN0LlVzZXJMb2dpbiA9IHRoaXMuc3RhdGUudXNlcklkO1xuICAgICAgICByZXF1ZXN0LlJlc2V0UGFzc3dvcmRUb2tlbiA9IHB5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdVU0VSX0FDVElPTl9LRVknKTtcbiAgICAgICAgcmVxdWVzdC5OZXdQYXNzd29yZCA9IHRoaXMuc3RhdGUucGFzc1ZhbHVlO1xuICAgICAgICBhcGkucmVzZXRQYXNzd29yZChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNS5zZXRTdGF0ZSh7IHZhbHVlU3VibWl0dGVkOiB0cnVlIH0pO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgYWxlcnQobWVzc1syNDBdKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzNiA9IHRoaXM7XG5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKF9weWRpbzJbJ2RlZmF1bHQnXS5yZXF1aXJlTGliKCdmb3JtJywgdHJ1ZSkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM2LnNldFN0YXRlKHsgZm9ybUxvYWRlZDogdHJ1ZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9uUGFzc0NoYW5nZTogZnVuY3Rpb24gb25QYXNzQ2hhbmdlKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGFzc1ZhbHVlOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgb25Vc2VySWRDaGFuZ2U6IGZ1bmN0aW9uIG9uVXNlcklkQ2hhbmdlKGV2ZW50LCBuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcklkOiBuZXdWYWx1ZSB9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHZhciBtZXNzID0gdGhpcy5wcm9wcy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciB2YWx1ZVN1Ym1pdHRlZCA9IF9zdGF0ZS52YWx1ZVN1Ym1pdHRlZDtcbiAgICAgICAgdmFyIGZvcm1Mb2FkZWQgPSBfc3RhdGUuZm9ybUxvYWRlZDtcbiAgICAgICAgdmFyIHBhc3NWYWx1ZSA9IF9zdGF0ZS5wYXNzVmFsdWU7XG4gICAgICAgIHZhciB1c2VySWQgPSBfc3RhdGUudXNlcklkO1xuXG4gICAgICAgIGlmICghdmFsdWVTdWJtaXR0ZWQgJiYgZm9ybUxvYWRlZCkge1xuXG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAnZGlhbG9nTGVnZW5kJyB9LFxuICAgICAgICAgICAgICAgICAgICBtZXNzWydndWkudXNlci44J11cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6ICdibHVyRGlhbG9nVGV4dEZpZWxkJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IG1lc3NbJ2d1aS51c2VyLjQnXSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMub25Vc2VySWRDaGFuZ2UuYmluZCh0aGlzKVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFB5ZGlvRm9ybS5WYWxpZFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2JsdXJEaWFsb2dUZXh0RmllbGQnLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vblBhc3NDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogeyBuYW1lOiAncGFzc3dvcmQnLCBsYWJlbDogbWVzc1sxOThdIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwYXNzVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGRpYWxvZ0ZpZWxkOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdWJtaXR0ZWQpIHtcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbWVzc1snZ3VpLnVzZXIuNiddXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFB5ZGlvUmVhY3RVSS5Mb2FkZXIsIG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG59KTtcblxuZXhwb3J0cy5DYWxsYmFja3MgPSBDYWxsYmFja3M7XG5leHBvcnRzLkxvZ2luUGFzc3dvcmREaWFsb2cgPSBMb2dpblBhc3N3b3JkRGlhbG9nO1xuZXhwb3J0cy5SZXNldFBhc3N3b3JkUmVxdWlyZSA9IFJlc2V0UGFzc3dvcmRSZXF1aXJlO1xuZXhwb3J0cy5SZXNldFBhc3N3b3JkRGlhbG9nID0gUmVzZXRQYXNzd29yZERpYWxvZztcbmV4cG9ydHMuTXVsdGlBdXRoTW9kaWZpZXIgPSBNdWx0aUF1dGhNb2RpZmllcjtcbmV4cG9ydHMuTGFuZ3VhZ2VQaWNrZXIgPSBMYW5ndWFnZVBpY2tlcjtcbiJdfQ==
