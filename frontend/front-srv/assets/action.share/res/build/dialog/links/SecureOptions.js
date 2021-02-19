'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _materialUi = require('material-ui');

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
var ModernStyles = _Pydio$requireLib2.ModernStyles;

var globStyles = {
    leftIcon: {
        margin: '0 16px 0 4px',
        color: '#757575'
    }
};

var PublicLinkSecureOptions = (function (_React$Component) {
    _inherits(PublicLinkSecureOptions, _React$Component);

    function PublicLinkSecureOptions() {
        var _this = this;

        _classCallCheck(this, PublicLinkSecureOptions);

        _get(Object.getPrototypeOf(PublicLinkSecureOptions.prototype), 'constructor', this).apply(this, arguments);

        this.state = {};

        this.updateDLExpirationField = function (event) {
            var newValue = event.currentTarget.value;
            if (parseInt(newValue) < 0) {
                newValue = -parseInt(newValue);
            }
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            link.MaxDownloads = newValue;
            linkModel.updateLink(link);
        };

        this.updateDaysExpirationField = function (event, newValue) {
            if (!newValue) {
                newValue = event.currentTarget.getValue();
            }
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            link.AccessEnd = newValue;
            linkModel.updateLink(link);
        };

        this.onDateChange = function (event, value) {
            var date2 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
            _this.updateDaysExpirationField(event, Math.floor(date2 / 1000) + "");
        };

        this.resetPassword = function () {
            var linkModel = _this.props.linkModel;

            linkModel.setUpdatePassword('');
            linkModel.getLink().PasswordRequired = false;
            linkModel.notifyDirty();
        };

        this.setUpdatingPassword = function (newValue) {
            _pydioUtilPass2['default'].checkPasswordStrength(newValue, function (ok, msg) {
                _this.setState({ updatingPassword: newValue, updatingPasswordValid: ok });
            });
        };

        this.changePassword = function () {
            var linkModel = _this.props.linkModel;
            var updatingPassword = _this.state.updatingPassword;

            linkModel.setUpdatePassword(updatingPassword);
            _this.setState({ pwPop: false, updatingPassword: "", updatingPasswordValid: false });
            linkModel.notifyDirty();
        };

        this.updatePassword = function (newValue, oldValue) {
            var linkModel = _this.props.linkModel;

            var valid = _this.refs.pwd.isValid();
            if (valid) {
                _this.setState({ invalidPassword: null, invalid: false }, function () {
                    linkModel.setUpdatePassword(newValue);
                });
            } else {
                _this.setState({ invalidPassword: newValue, invalid: true });
            }
        };

        this.resetDownloads = function () {
            if (window.confirm(_this.props.getMessage('106'))) {
                var linkModel = _this.props.linkModel;

                linkModel.getLink().CurrentDownloads = "0";
                linkModel.notifyDirty();
            }
        };

        this.resetExpiration = function () {
            var linkModel = _this.props.linkModel;

            linkModel.getLink().AccessEnd = "0";
            linkModel.notifyDirty();
        };

        this.renderPasswordContainer = function () {
            var linkModel = _this.props.linkModel;

            var link = linkModel.getLink();
            var auth = _mainShareHelper2['default'].getAuthorizations();
            var passwordField = undefined,
                resetPassword = undefined,
                updatePassword = undefined;
            if (link.PasswordRequired) {
                resetPassword = _react2['default'].createElement(_materialUi.FlatButton, {
                    disabled: _this.props.isReadonly() || !linkModel.isEditable() || auth.password_mandatory,
                    secondary: true,
                    onTouchTap: _this.resetPassword,
                    label: _this.props.getMessage('174')
                });
                updatePassword = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.FlatButton, {
                        disabled: _this.props.isReadonly() || !linkModel.isEditable(),
                        secondary: true,
                        onTouchTap: function (e) {
                            _this.setState({ pwPop: true, pwAnchor: e.currentTarget });
                        },
                        label: _this.props.getMessage('181')
                    }),
                    _react2['default'].createElement(
                        _materialUi.Popover,
                        {
                            open: _this.state.pwPop,
                            anchorEl: _this.state.pwAnchor,
                            anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            onRequestClose: function () {
                                _this.setState({ pwPop: false });
                            }
                        },
                        _react2['default'].createElement(
                            'div',
                            { style: { width: 280, padding: 8 } },
                            _react2['default'].createElement(ValidPassword, {
                                name: "update",
                                ref: "pwdUpdate",
                                attributes: { label: _this.props.getMessage('23') },
                                value: _this.state.updatingPassword ? _this.state.updatingPassword : "",
                                onChange: function (v) {
                                    _this.setUpdatingPassword(v);
                                }
                            }),
                            _react2['default'].createElement(
                                'div',
                                { style: { paddingTop: 20, textAlign: 'right' } },
                                _react2['default'].createElement(_materialUi.FlatButton, { label: _pydio2['default'].getMessages()['54'], onTouchTap: function () {
                                        _this.setState({ pwPop: false, updatingPassword: '' });
                                    } }),
                                _react2['default'].createElement(_materialUi.FlatButton, { style: { minWidth: 60 }, label: _pydio2['default'].getMessages()['48'], onTouchTap: function () {
                                        _this.changePassword();
                                    }, disabled: !_this.state.updatingPassword || !_this.state.updatingPasswordValid })
                            )
                        )
                    )
                );
                passwordField = _react2['default'].createElement(ModernTextField, {
                    floatingLabelText: _this.props.getMessage('23'),
                    disabled: true,
                    value: '********',
                    fullWidth: true
                });
            } else if (!_this.props.isReadonly() && linkModel.isEditable()) {
                passwordField = _react2['default'].createElement(ValidPassword, {
                    name: 'share-password',
                    ref: "pwd",
                    attributes: { label: _this.props.getMessage('23') },
                    value: _this.state.invalidPassword ? _this.state.invalidPassword : linkModel.updatePassword,
                    onChange: _this.updatePassword
                });
            }
            if (passwordField) {
                return _react2['default'].createElement(
                    'div',
                    { className: 'password-container', style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-file-lock', style: globStyles.leftIcon }),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: resetPassword ? '40%' : '100%', display: 'inline-block' } },
                        passwordField
                    ),
                    resetPassword && _react2['default'].createElement(
                        'div',
                        { style: { width: '60%', display: 'flex' } },
                        resetPassword,
                        ' ',
                        updatePassword
                    )
                );
            } else {
                return null;
            }
        };

        this.formatDate = function (dateObject) {
            var dateFormatDay = _this.props.getMessage('date_format', '').split(' ').shift();
            return dateFormatDay.replace('Y', dateObject.getFullYear()).replace('m', dateObject.getMonth() + 1).replace('d', dateObject.getDate());
        };
    }

    _createClass(PublicLinkSecureOptions, [{
        key: 'render',
        value: function render() {
            var linkModel = this.props.linkModel;

            var link = linkModel.getLink();

            var passContainer = this.renderPasswordContainer();
            var crtLinkDLAllowed = linkModel.hasPermission('Download') && !linkModel.hasPermission('Preview') && !linkModel.hasPermission('Upload');
            var dlLimitValue = parseInt(link.MaxDownloads);
            var expirationDateValue = parseInt(link.AccessEnd);

            var calIcon = _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-calendar-clock', style: globStyles.leftIcon });
            var expDate = undefined,
                maxDate = undefined,
                dlCounterString = undefined,
                dateExpired = false,
                dlExpired = false;
            var today = new Date();

            var auth = _mainShareHelper2['default'].getAuthorizations();
            if (parseInt(auth.max_expiration) > 0) {
                maxDate = new Date();
                maxDate.setDate(today.getDate() + parseInt(auth.max_expiration));
            }
            if (parseInt(auth.max_downloads) > 0) {
                dlLimitValue = Math.max(1, Math.min(dlLimitValue, parseInt(auth.max_downloads)));
            }

            if (expirationDateValue) {
                if (expirationDateValue < 0) {
                    dateExpired = true;
                }
                expDate = new Date(expirationDateValue * 1000);
                if (!parseInt(auth.max_expiration)) {
                    calIcon = _react2['default'].createElement(_materialUi.IconButton, { iconStyle: { color: globStyles.leftIcon.color }, style: { marginLeft: -8, marginRight: 8 }, iconClassName: 'mdi mdi-close-circle', onTouchTap: this.resetExpiration.bind(this) });
                }
            }
            if (dlLimitValue) {
                var dlCounter = parseInt(link.CurrentDownloads) || 0;
                var resetLink = undefined;
                if (dlCounter) {
                    resetLink = _react2['default'].createElement(
                        'a',
                        { style: { cursor: 'pointer' }, onClick: this.resetDownloads.bind(this), title: this.props.getMessage('17') },
                        '(',
                        this.props.getMessage('16'),
                        ')'
                    );
                    if (dlCounter >= dlLimitValue) {
                        dlExpired = true;
                    }
                }
                dlCounterString = _react2['default'].createElement(
                    'span',
                    { className: 'dlCounterString' },
                    dlCounter + '/' + dlLimitValue,
                    ' ',
                    resetLink
                );
            }
            return _react2['default'].createElement(
                'div',
                { style: _extends({ padding: 10 }, this.props.style) },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                    this.props.getMessage('24')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingRight: 10 } },
                    passContainer,
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, display: 'flex', alignItems: 'baseline', position: 'relative' }, className: dateExpired ? 'limit-block-expired' : null },
                        calIcon,
                        _react2['default'].createElement(_materialUi.DatePicker, _extends({
                            ref: 'expirationDate',
                            key: 'start',
                            value: expDate,
                            minDate: new Date(),
                            maxDate: maxDate,
                            autoOk: true,
                            disabled: this.props.isReadonly() || !linkModel.isEditable(),
                            onChange: this.onDateChange,
                            showYearSelector: true,
                            hintText: this.props.getMessage(dateExpired ? '21b' : '21'),
                            mode: 'landscape',
                            formatDate: this.formatDate,
                            style: { flex: 1 },
                            fullWidth: true
                        }, ModernStyles.textField))
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, alignItems: 'baseline', display: crtLinkDLAllowed ? 'flex' : 'none', position: 'relative' }, className: dlExpired ? 'limit-block-expired' : null },
                        _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-download', style: globStyles.leftIcon }),
                        _react2['default'].createElement(ModernTextField, {
                            type: 'number',
                            disabled: this.props.isReadonly() || !linkModel.isEditable(),
                            floatingLabelText: this.props.getMessage(dlExpired ? '22b' : '22'),
                            value: dlLimitValue > 0 ? dlLimitValue : '',
                            onChange: this.updateDLExpirationField,
                            fullWidth: true,
                            style: { flex: 1 }
                        }),
                        _react2['default'].createElement(
                            'span',
                            { style: { position: 'absolute', right: 10, top: 14, fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)' } },
                            dlCounterString
                        )
                    )
                )
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']).isRequired,
            style: _propTypes2['default'].object
        },
        enumerable: true
    }]);

    return PublicLinkSecureOptions;
})(_react2['default'].Component);

exports['default'] = PublicLinkSecureOptions = (0, _ShareContextConsumer2['default'])(PublicLinkSecureOptions);
exports['default'] = PublicLinkSecureOptions;
module.exports = exports['default'];
