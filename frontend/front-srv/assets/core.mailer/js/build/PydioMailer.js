(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioMailer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _get = function get(_x10, _x11, _x12) { var _again = true; _function: while (_again) { var object = _x10, property = _x11, receiver = _x12; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x10 = parent; _x11 = property; _x12 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var styles = {
    chip: {
        marginRight: 4,
        marginBottom: 4
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.33)',
        paddingTop: 77,
        zIndex: 100
    }
};

var DestBadge = (function (_React$Component) {
    _inherits(DestBadge, _React$Component);

    function DestBadge() {
        _classCallCheck(this, DestBadge);

        _get(Object.getPrototypeOf(DestBadge.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DestBadge, [{
        key: 'render',
        value: function render() {
            var userObject = this.props.user;
            return _react2['default'].createElement(
                'div',
                { className: "share-dialog user-badge user-type-" + (userObject.getTemporary() ? "tmp_user" : "user") },
                _react2['default'].createElement('span', { className: "avatar icon-" + (userObject.getTemporary() ? "envelope" : "user") }),
                _react2['default'].createElement(
                    'span',
                    { className: 'user-badge-label' },
                    userObject.getExtendedLabel() || userObject.getLabel()
                )
            );
        }
    }]);

    return DestBadge;
})(_react2['default'].Component);

var UserChip = (function (_React$Component2) {
    _inherits(UserChip, _React$Component2);

    function UserChip() {
        _classCallCheck(this, UserChip);

        _get(Object.getPrototypeOf(UserChip.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(UserChip, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var user = _props.user;
            var onRemove = _props.onRemove;

            var tmp = user.FreeValue;
            var label = undefined;
            if (tmp) {
                label = user.FreeValue;
            } else {
                if (user.Attributes && user.Attributes['displayName']) {
                    label = user.Attributes['displayName'];
                } else {
                    label = user.Login;
                }
            }

            var icon = _react2['default'].createElement(_materialUi.FontIcon, { className: "icon-" + (tmp ? "envelope" : "user") });
            var colors = _materialUi.Style.colors;

            return _react2['default'].createElement(
                _materialUi.Chip,
                {
                    backgroundColor: tmp ? colors.lightBlue100 : colors.blueGrey100,
                    onRequestDelete: function () {
                        onRemove();
                    },
                    style: styles.chip
                },
                _react2['default'].createElement(_materialUi.Avatar, { icon: icon, color: tmp ? 'white' : colors.blueGrey600, backgroundColor: tmp ? colors.lightBlue300 : colors.blueGrey300 }),
                label
            );
        }
    }]);

    return UserChip;
})(_react2['default'].Component);

var Email = (function () {
    function Email() {
        var subject = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var message = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var link = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        _classCallCheck(this, Email);

        this._subjects = [];
        this._messages = [];
        this._targets = [];
        this._links = [];
        this.templateId = "";
        this.templateData = {};
        if (subject) {
            this._subjects.push(subject);
        }
        if (message) {
            this._messages.push(message);
        }
        if (link) {
            this._links.push(link);
        }
    }

    _createClass(Email, [{
        key: 'addTarget',
        value: function addTarget(userOrEmail) {
            var subject = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var message = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var link = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            this._targets.push(userOrEmail);
            if (subject) {
                this._subjects.push(subject);
            }
            if (message) {
                this._messages.push(message);
            }
            if (link) {
                this._links.push(link);
            }
        }
    }, {
        key: 'setTemplateData',
        value: function setTemplateData(templateId, templateData) {
            this.templateId = templateId;
            this.templateData = templateData;
        }

        /**
         *
         * @param targets Array
         * @param subject string
         * @param templateId string
         * @param templateData Object
         * @return {Promise}
         */
    }, {
        key: 'postOne',
        value: function postOne(targets, subject, templateId, templateData) {
            var api = new _pydioHttpRestApi.MailerServiceApi(_pydioHttpApi2['default'].getRestClient());
            var email = new _pydioHttpRestApi.MailerMail();
            email.Subject = subject;
            email.To = targets.map(function (t) {
                return _pydioHttpRestApi.MailerUser.constructFromObject({ Uuid: t });
            });
            email.TemplateId = templateId;
            email.TemplateData = templateData;
            return api.send(email);
        }
    }, {
        key: 'post',
        value: function post() {
            var _this = this;

            var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            if (!this._subjects.length && !this.templateId || !this._targets.length || !this._messages.length) {
                throw new Error('Invalid data');
            }
            var templateData = _extends({}, this.templateData);
            var proms = [];

            if (this._messages.length > 1 && this._messages.length === this._targets.length && this._subjects.length === this._targets.length) {
                // Send as many emails as targets with their own messages
                this._targets.map(function (t, i) {
                    var subject = _this._subjects[i];
                    templateData = _extends({}, templateData, { Message: _this._messages[i] });
                    proms.push(_this.postOne([t], subject, _this.templateId, templateData));
                });
            } else {
                var subject = this._subjects[0];
                templateData['Message'] = this._messages[0];
                proms.push(this.postOne(this._targets, subject, this.templateId, templateData));
            }

            Promise.all(proms).then(function () {
                callback(true);
            })['catch'](function (e) {
                callback(false);
            });
        }
    }]);

    return Email;
})();

var Pane = (function (_React$Component3) {
    _inherits(Pane, _React$Component3);

    function Pane(props) {
        _classCallCheck(this, Pane);

        if (props.showAddressBook === undefined) {
            props.showAddressBook = true;
        }
        _get(Object.getPrototypeOf(Pane.prototype), 'constructor', this).call(this, props);
        this.state = {
            users: this.props.users || {},
            subject: this.props.subject,
            message: this.props.message,
            errorMessage: null,
            posting: false
        };
    }

    _createClass(Pane, [{
        key: 'updateSubject',
        value: function updateSubject(event) {
            this.setState({ subject: event.currentTarget.value });
        }
    }, {
        key: 'updateMessage',
        value: function updateMessage(event) {
            this.setState({ message: event.currentTarget.value });
        }
    }, {
        key: 'addUser',
        value: function addUser(userObject) {
            var users = this.state.users;

            if (userObject.FreeValue) {
                users[userObject.FreeValue] = userObject;
            } else if (userObject.IdmUser) {
                users[userObject.IdmUser.Login] = userObject.IdmUser;
            }
            this.setState({ users: users, errorMessage: null });
        }
    }, {
        key: 'removeUser',
        value: function removeUser(userId) {
            var users = this.state.users;

            delete users[userId];
            this.setState({ users: users });
        }
    }, {
        key: 'getMessage',
        value: function getMessage(messageId) {
            var nameSpace = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

            try {
                if (nameSpace === undefined) {
                    nameSpace = 'core.mailer';
                }
                if (nameSpace) {
                    nameSpace += ".";
                }
                return pydio.MessageHash[nameSpace + messageId];
            } catch (e) {
                return messageId;
            }
        }
    }, {
        key: 'postEmail',
        value: function postEmail() {
            var _this2 = this;

            var repost = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var _state = this.state;
            var users = _state.users;
            var subject = _state.subject;
            var message = _state.message;

            if (!repost && this.refs.completer && this.refs.completer.getPendingSearchText && this.refs.completer.getPendingSearchText()) {
                this.refs.completer.onCompleterRequest(this.refs.completer.getPendingSearchText(), -1);
                setTimeout(function () {
                    return _this2.postEmail(true);
                }, 500);
                return;
            }
            if (!Object.keys(users).length) {
                this.setState({ errorMessage: this.getMessage(2) });
                return;
            }
            var _props2 = this.props;
            var link = _props2.link;
            var templateId = _props2.templateId;
            var templateData = _props2.templateData;

            var callback = function callback(res) {
                _this2.setState({ posting: false });
                if (res) {
                    if (_this2.props.onDismiss) {
                        _this2.props.onDismiss();
                    } else {
                        _this2.props.pydio.UI.displayMessage('SUCCESS', _this2.props.pydio.MessageHash["core.mailer.1"].replace('%s', Object.keys(users).length));
                        _this2.setState({ users: {}, subject: '', message: '' });
                    }
                }
            };
            this.setState({ posting: true });

            if (this.props.processPost) {
                this.props.processPost(Email, users, subject, message, link, callback);
                return;
            }

            var email = new Email(subject, message, link || null);
            Object.keys(users).forEach(function (k) {
                email.addTarget(k);
            });
            if (templateId) {
                email.setTemplateData(templateId, templateData);
            }
            email.post(callback);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state2 = this.state;
            var users = _state2.users;
            var posting = _state2.posting;
            var errorMessage = _state2.errorMessage;
            var subject = _state2.subject;
            var message = _state2.message;

            var className = [this.props.className, "react-mailer", "reset-pydio-forms"].join(" ");
            var usersChips = Object.keys(users).map((function (uId) {
                var _this3 = this;

                return _react2['default'].createElement(UserChip, { key: uId, user: users[uId], onRemove: function () {
                        _this3.removeUser(uId);
                    } });
            }).bind(this));
            var errorDiv = undefined;
            if (errorMessage) {
                errorDiv = _react2['default'].createElement(
                    'div',
                    { style: { padding: '10px 20px', color: 'red' } },
                    errorMessage
                );
            }
            var style = _extends({
                margin: this.props.uniqueUserStyle ? 0 : 8
            }, this.props.style);
            var content = _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: this.props.zDepth !== undefined ? this.props.zDepth : 2, className: className, style: style },
                _react2['default'].createElement(
                    'h3',
                    { style: _extends({ padding: 20, color: 'rgba(0,0,0,0.87)', fontSize: 25, marginBottom: 0, paddingBottom: 10 }, this.props.titleStyle) },
                    this.props.panelTitle
                ),
                errorDiv,
                this.props.additionalPaneTop,
                !this.props.uniqueUserStyle && _react2['default'].createElement(
                    'div',
                    { className: 'users-block', style: _extends({ padding: '0 20px' }, this.props.usersBlockStyle) },
                    _react2['default'].createElement(PydioComponents.UsersCompleter, {
                        ref: 'completer',
                        fieldLabel: this.getMessage('8'),
                        usersOnly: true,
                        existingOnly: true,
                        freeValueAllowed: true,
                        onValueSelected: this.addUser.bind(this),
                        excludes: Object.keys(users),
                        renderSuggestion: function (userObject) {
                            return _react2['default'].createElement(DestBadge, { user: userObject });
                        },
                        pydio: pydio,
                        showAddressBook: this.props.showAddressBook,
                        underlineHide: true
                    }),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.wrapper },
                        usersChips
                    )
                ),
                !this.props.uniqueUserStyle && _react2['default'].createElement(_materialUi.Divider, null),
                !this.props.templateId && _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, underlineShow: false, floatingLabelText: this.getMessage('6'), value: subject, onChange: this.updateSubject.bind(this) })
                ),
                !this.props.templateId && _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: _extends({ padding: '0 20px' }, this.props.messageBlockStyle) },
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: true,
                        underlineShow: false,
                        floatingLabelText: this.getMessage('7'),
                        value: message,
                        multiLine: true,
                        onChange: this.updateMessage.bind(this),
                        rowsMax: 6
                    })
                ),
                this.props.additionalPaneBottom,
                _react2['default'].createElement(_materialUi.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'right', padding: '8px 20px' } },
                    this.props.onDismiss && _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('54', ''), onTouchTap: this.props.onDismiss }),
                    !this.props.onDismiss && _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('216', ''), onTouchTap: function () {
                            _this4.setState({ users: {}, subject: '', message: '' });
                        } }),
                    _react2['default'].createElement(_materialUi.FlatButton, { disabled: posting, primary: true, label: this.getMessage('77', ''), onTouchTap: function (e) {
                            return _this4.postEmail();
                        } })
                )
            );
            if (this.props.overlay) {
                return _react2['default'].createElement(
                    'div',
                    { style: styles.overlay },
                    content
                );
            } else {
                return content;
            }
        }
    }]);

    return Pane;
})(_react2['default'].Component);

Pane.PropTypes = {
    message: _react2['default'].PropTypes.string,
    subject: _react2['default'].PropTypes.string,
    templateId: _react2['default'].PropTypes.string,
    templateData: _react2['default'].PropTypes.object,
    link: _react2['default'].PropTypes.string,
    onDismiss: _react2['default'].PropTypes.func,
    className: _react2['default'].PropTypes.string,
    overlay: _react2['default'].PropTypes.bool,
    uniqueUserStyle: _react2['default'].PropTypes.bool,
    users: _react2['default'].PropTypes.object,
    panelTitle: _react2['default'].PropTypes.string,
    zDepth: _react2['default'].PropTypes.number,
    showAddressBook: _react2['default'].PropTypes.bool,
    processPost: _react2['default'].PropTypes.func,
    additionalPaneTop: _react2['default'].PropTypes.instanceOf(_react2['default'].Component),
    additionalPaneBottom: _react2['default'].PropTypes.instanceOf(_react2['default'].Component)
};

var PreferencesPanel = (function (_React$Component4) {
    _inherits(PreferencesPanel, _React$Component4);

    function PreferencesPanel() {
        _classCallCheck(this, PreferencesPanel);

        _get(Object.getPrototypeOf(PreferencesPanel.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PreferencesPanel, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                null,
                'Preferences Panel'
            );
        }
    }]);

    return PreferencesPanel;
})(_react2['default'].Component);

exports.Pane = Pane;
exports.PreferencesPanel = PreferencesPanel;

},{"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _components = require("./components");

exports.Pane = _components.Pane;
exports.PreferencesPanel = _components.PreferencesPanel;

},{"./components":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9jb21wb25lbnRzLmpzIiwianMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gxMCwgX3gxMSwgX3gxMikgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDEwLCBwcm9wZXJ0eSA9IF94MTEsIHJlY2VpdmVyID0gX3gxMjsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDEwID0gcGFyZW50OyBfeDExID0gcHJvcGVydHk7IF94MTIgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX3JlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIF9yZWFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdCk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9weWRpb0h0dHBSZXN0QXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9yZXN0LWFwaScpO1xuXG52YXIgc3R5bGVzID0ge1xuICAgIGNoaXA6IHtcbiAgICAgICAgbWFyZ2luUmlnaHQ6IDQsXG4gICAgICAgIG1hcmdpbkJvdHRvbTogNFxuICAgIH0sXG4gICAgd3JhcHBlcjoge1xuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGZsZXhXcmFwOiAnd3JhcCdcbiAgICB9LFxuICAgIG92ZXJsYXk6IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjMzKScsXG4gICAgICAgIHBhZGRpbmdUb3A6IDc3LFxuICAgICAgICB6SW5kZXg6IDEwMFxuICAgIH1cbn07XG5cbnZhciBEZXN0QmFkZ2UgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRGVzdEJhZGdlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERlc3RCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERlc3RCYWRnZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGVzdEJhZGdlLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERlc3RCYWRnZSwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciB1c2VyT2JqZWN0ID0gdGhpcy5wcm9wcy51c2VyO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcInNoYXJlLWRpYWxvZyB1c2VyLWJhZGdlIHVzZXItdHlwZS1cIiArICh1c2VyT2JqZWN0LmdldFRlbXBvcmFyeSgpID8gXCJ0bXBfdXNlclwiIDogXCJ1c2VyXCIpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJhdmF0YXIgaWNvbi1cIiArICh1c2VyT2JqZWN0LmdldFRlbXBvcmFyeSgpID8gXCJlbnZlbG9wZVwiIDogXCJ1c2VyXCIpIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdXNlck9iamVjdC5nZXRFeHRlbmRlZExhYmVsKCkgfHwgdXNlck9iamVjdC5nZXRMYWJlbCgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEZXN0QmFkZ2U7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIFVzZXJDaGlwID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhVc2VyQ2hpcCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gVXNlckNoaXAoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyQ2hpcCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlckNoaXAucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlckNoaXAsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB1c2VyID0gX3Byb3BzLnVzZXI7XG4gICAgICAgICAgICB2YXIgb25SZW1vdmUgPSBfcHJvcHMub25SZW1vdmU7XG5cbiAgICAgICAgICAgIHZhciB0bXAgPSB1c2VyLkZyZWVWYWx1ZTtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0bXApIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuRnJlZVZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlci5BdHRyaWJ1dGVzICYmIHVzZXIuQXR0cmlidXRlc1snZGlzcGxheU5hbWUnXSkge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuQXR0cmlidXRlc1snZGlzcGxheU5hbWUnXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJpY29uLVwiICsgKHRtcCA/IFwiZW52ZWxvcGVcIiA6IFwidXNlclwiKSB9KTtcbiAgICAgICAgICAgIHZhciBjb2xvcnMgPSBfbWF0ZXJpYWxVaS5TdHlsZS5jb2xvcnM7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0bXAgPyBjb2xvcnMubGlnaHRCbHVlMTAwIDogY29sb3JzLmJsdWVHcmV5MTAwLFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3REZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZXMuY2hpcFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQXZhdGFyLCB7IGljb246IGljb24sIGNvbG9yOiB0bXAgPyAnd2hpdGUnIDogY29sb3JzLmJsdWVHcmV5NjAwLCBiYWNrZ3JvdW5kQ29sb3I6IHRtcCA/IGNvbG9ycy5saWdodEJsdWUzMDAgOiBjb2xvcnMuYmx1ZUdyZXkzMDAgfSksXG4gICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlckNoaXA7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEVtYWlsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbWFpbCgpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG4gICAgICAgIHZhciBsaW5rID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW1haWwpO1xuXG4gICAgICAgIHRoaXMuX3N1YmplY3RzID0gW107XG4gICAgICAgIHRoaXMuX21lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMuX3RhcmdldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbGlua3MgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZUlkID0gXCJcIjtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZURhdGEgPSB7fTtcbiAgICAgICAgaWYgKHN1YmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YmplY3RzLnB1c2goc3ViamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgIHRoaXMuX2xpbmtzLnB1c2gobGluayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW1haWwsIFt7XG4gICAgICAgIGtleTogJ2FkZFRhcmdldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUYXJnZXQodXNlck9yRW1haWwpIHtcbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICAgICAgdGhpcy5fdGFyZ2V0cy5wdXNoKHVzZXJPckVtYWlsKTtcbiAgICAgICAgICAgIGlmIChzdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdHMucHVzaChzdWJqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlua3MucHVzaChsaW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0VGVtcGxhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFRlbXBsYXRlRGF0YSh0ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVJZCA9IHRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0cyBBcnJheVxuICAgICAgICAgKiBAcGFyYW0gc3ViamVjdCBzdHJpbmdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlSWQgc3RyaW5nXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZURhdGEgT2JqZWN0XG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9zdE9uZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb3N0T25lKHRhcmdldHMsIHN1YmplY3QsIHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSkge1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJTZXJ2aWNlQXBpKF9weWRpb0h0dHBBcGkyWydkZWZhdWx0J10uZ2V0UmVzdENsaWVudCgpKTtcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IG5ldyBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJNYWlsKCk7XG4gICAgICAgICAgICBlbWFpbC5TdWJqZWN0ID0gc3ViamVjdDtcbiAgICAgICAgICAgIGVtYWlsLlRvID0gdGFyZ2V0cy5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyVXNlci5jb25zdHJ1Y3RGcm9tT2JqZWN0KHsgVXVpZDogdCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZW1haWwuVGVtcGxhdGVJZCA9IHRlbXBsYXRlSWQ7XG4gICAgICAgICAgICBlbWFpbC5UZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnNlbmQoZW1haWwpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb3N0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvc3QoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3N1YmplY3RzLmxlbmd0aCAmJiAhdGhpcy50ZW1wbGF0ZUlkIHx8ICF0aGlzLl90YXJnZXRzLmxlbmd0aCB8fCAhdGhpcy5fbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBfZXh0ZW5kcyh7fSwgdGhpcy50ZW1wbGF0ZURhdGEpO1xuICAgICAgICAgICAgdmFyIHByb21zID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9tZXNzYWdlcy5sZW5ndGggPiAxICYmIHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA9PT0gdGhpcy5fdGFyZ2V0cy5sZW5ndGggJiYgdGhpcy5fc3ViamVjdHMubGVuZ3RoID09PSB0aGlzLl90YXJnZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vIFNlbmQgYXMgbWFueSBlbWFpbHMgYXMgdGFyZ2V0cyB3aXRoIHRoZWlyIG93biBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIHRoaXMuX3RhcmdldHMubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gX3RoaXMuX3N1YmplY3RzW2ldO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBfZXh0ZW5kcyh7fSwgdGVtcGxhdGVEYXRhLCB7IE1lc3NhZ2U6IF90aGlzLl9tZXNzYWdlc1tpXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChfdGhpcy5wb3N0T25lKFt0XSwgc3ViamVjdCwgX3RoaXMudGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gdGhpcy5fc3ViamVjdHNbMF07XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhWydNZXNzYWdlJ10gPSB0aGlzLl9tZXNzYWdlc1swXTtcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHRoaXMucG9zdE9uZSh0aGlzLl90YXJnZXRzLCBzdWJqZWN0LCB0aGlzLnRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChwcm9tcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVtYWlsO1xufSkoKTtcblxudmFyIFBhbmUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQzKSB7XG4gICAgX2luaGVyaXRzKFBhbmUsIF9SZWFjdCRDb21wb25lbnQzKTtcblxuICAgIGZ1bmN0aW9uIFBhbmUocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhbmUpO1xuXG4gICAgICAgIGlmIChwcm9wcy5zaG93QWRkcmVzc0Jvb2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHMuc2hvd0FkZHJlc3NCb29rID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQYW5lLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXNlcnM6IHRoaXMucHJvcHMudXNlcnMgfHwge30sXG4gICAgICAgICAgICBzdWJqZWN0OiB0aGlzLnByb3BzLnN1YmplY3QsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLnByb3BzLm1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IG51bGwsXG4gICAgICAgICAgICBwb3N0aW5nOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQYW5lLCBbe1xuICAgICAgICBrZXk6ICd1cGRhdGVTdWJqZWN0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZVN1YmplY3QoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzdWJqZWN0OiBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVNZXNzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZU1lc3NhZ2UoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZXNzYWdlOiBldmVudC5jdXJyZW50VGFyZ2V0LnZhbHVlIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhZGRVc2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFVzZXIodXNlck9iamVjdCkge1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gdGhpcy5zdGF0ZS51c2VycztcblxuICAgICAgICAgICAgaWYgKHVzZXJPYmplY3QuRnJlZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdXNlcnNbdXNlck9iamVjdC5GcmVlVmFsdWVdID0gdXNlck9iamVjdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlck9iamVjdC5JZG1Vc2VyKSB7XG4gICAgICAgICAgICAgICAgdXNlcnNbdXNlck9iamVjdC5JZG1Vc2VyLkxvZ2luXSA9IHVzZXJPYmplY3QuSWRtVXNlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VyczogdXNlcnMsIGVycm9yTWVzc2FnZTogbnVsbCB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVtb3ZlVXNlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVVc2VyKHVzZXJJZCkge1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gdGhpcy5zdGF0ZS51c2VycztcblxuICAgICAgICAgICAgZGVsZXRlIHVzZXJzW3VzZXJJZF07XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcnM6IHVzZXJzIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRNZXNzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZUlkKSB7XG4gICAgICAgICAgICB2YXIgbmFtZVNwYWNlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmIChuYW1lU3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBuYW1lU3BhY2UgPSAnY29yZS5tYWlsZXInO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmFtZVNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVTcGFjZSArPSBcIi5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHB5ZGlvLk1lc3NhZ2VIYXNoW25hbWVTcGFjZSArIG1lc3NhZ2VJZF07XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9zdEVtYWlsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvc3RFbWFpbCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgcmVwb3N0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IF9zdGF0ZS51c2VycztcbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gX3N0YXRlLnN1YmplY3Q7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IF9zdGF0ZS5tZXNzYWdlO1xuXG4gICAgICAgICAgICBpZiAoIXJlcG9zdCAmJiB0aGlzLnJlZnMuY29tcGxldGVyICYmIHRoaXMucmVmcy5jb21wbGV0ZXIuZ2V0UGVuZGluZ1NlYXJjaFRleHQgJiYgdGhpcy5yZWZzLmNvbXBsZXRlci5nZXRQZW5kaW5nU2VhcmNoVGV4dCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZzLmNvbXBsZXRlci5vbkNvbXBsZXRlclJlcXVlc3QodGhpcy5yZWZzLmNvbXBsZXRlci5nZXRQZW5kaW5nU2VhcmNoVGV4dCgpLCAtMSk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczIucG9zdEVtYWlsKHRydWUpO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyh1c2VycykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yTWVzc2FnZTogdGhpcy5nZXRNZXNzYWdlKDIpIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfcHJvcHMyID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciBsaW5rID0gX3Byb3BzMi5saW5rO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlSWQgPSBfcHJvcHMyLnRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gX3Byb3BzMi50ZW1wbGF0ZURhdGE7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uIGNhbGxiYWNrKHJlcykge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHBvc3Rpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMi5wcm9wcy5vbkRpc21pc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5weWRpby5VSS5kaXNwbGF5TWVzc2FnZSgnU1VDQ0VTUycsIF90aGlzMi5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtcImNvcmUubWFpbGVyLjFcIl0ucmVwbGFjZSgnJXMnLCBPYmplY3Qua2V5cyh1c2VycykubGVuZ3RoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczIuc2V0U3RhdGUoeyB1c2Vyczoge30sIHN1YmplY3Q6ICcnLCBtZXNzYWdlOiAnJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcG9zdGluZzogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucHJvY2Vzc1Bvc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnByb2Nlc3NQb3N0KEVtYWlsLCB1c2Vycywgc3ViamVjdCwgbWVzc2FnZSwgbGluaywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVtYWlsID0gbmV3IEVtYWlsKHN1YmplY3QsIG1lc3NhZ2UsIGxpbmsgfHwgbnVsbCk7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VycykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIGVtYWlsLmFkZFRhcmdldChrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgICAgICAgICBlbWFpbC5zZXRUZW1wbGF0ZURhdGEodGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVtYWlsLnBvc3QoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBfc3RhdGUyID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IF9zdGF0ZTIudXNlcnM7XG4gICAgICAgICAgICB2YXIgcG9zdGluZyA9IF9zdGF0ZTIucG9zdGluZztcbiAgICAgICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBfc3RhdGUyLmVycm9yTWVzc2FnZTtcbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gX3N0YXRlMi5zdWJqZWN0O1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBfc3RhdGUyLm1lc3NhZ2U7XG5cbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBbdGhpcy5wcm9wcy5jbGFzc05hbWUsIFwicmVhY3QtbWFpbGVyXCIsIFwicmVzZXQtcHlkaW8tZm9ybXNcIl0uam9pbihcIiBcIik7XG4gICAgICAgICAgICB2YXIgdXNlcnNDaGlwcyA9IE9iamVjdC5rZXlzKHVzZXJzKS5tYXAoKGZ1bmN0aW9uICh1SWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyQ2hpcCwgeyBrZXk6IHVJZCwgdXNlcjogdXNlcnNbdUlkXSwgb25SZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMy5yZW1vdmVVc2VyKHVJZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHZhciBlcnJvckRpdiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmIChlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBlcnJvckRpdiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTBweCAyMHB4JywgY29sb3I6ICdyZWQnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHlsZSA9IF9leHRlbmRzKHtcbiAgICAgICAgICAgICAgICBtYXJnaW46IHRoaXMucHJvcHMudW5pcXVlVXNlclN0eWxlID8gMCA6IDhcbiAgICAgICAgICAgIH0sIHRoaXMucHJvcHMuc3R5bGUpO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnQgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5QYXBlcixcbiAgICAgICAgICAgICAgICB7IHpEZXB0aDogdGhpcy5wcm9wcy56RGVwdGggIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuekRlcHRoIDogMiwgY2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZSB9LFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnaDMnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6IDIwLCBjb2xvcjogJ3JnYmEoMCwwLDAsMC44NyknLCBmb250U2l6ZTogMjUsIG1hcmdpbkJvdHRvbTogMCwgcGFkZGluZ0JvdHRvbTogMTAgfSwgdGhpcy5wcm9wcy50aXRsZVN0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnBhbmVsVGl0bGVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGVycm9yRGl2LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkaXRpb25hbFBhbmVUb3AsXG4gICAgICAgICAgICAgICAgIXRoaXMucHJvcHMudW5pcXVlVXNlclN0eWxlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2Vycy1ibG9jaycsIHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICcwIDIwcHgnIH0sIHRoaXMucHJvcHMudXNlcnNCbG9ja1N0eWxlKSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudHMuVXNlcnNDb21wbGV0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvbXBsZXRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZExhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyZWVWYWx1ZUFsbG93ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbHVlU2VsZWN0ZWQ6IHRoaXMuYWRkVXNlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IE9iamVjdC5rZXlzKHVzZXJzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclN1Z2dlc3Rpb246IGZ1bmN0aW9uICh1c2VyT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KERlc3RCYWRnZSwgeyB1c2VyOiB1c2VyT2JqZWN0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRyZXNzQm9vazogdGhpcy5wcm9wcy5zaG93QWRkcmVzc0Jvb2ssXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVIaWRlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLndyYXBwZXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzQ2hpcHNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgIXRoaXMucHJvcHMudW5pcXVlVXNlclN0eWxlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnRlbXBsYXRlSWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmdldE1lc3NhZ2UoJzYnKSwgdmFsdWU6IHN1YmplY3QsIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZVN1YmplY3QuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgIXRoaXMucHJvcHMudGVtcGxhdGVJZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IF9leHRlbmRzKHsgcGFkZGluZzogJzAgMjBweCcgfSwgdGhpcy5wcm9wcy5tZXNzYWdlQmxvY2tTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVTaG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmdldE1lc3NhZ2UoJzcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlMaW5lOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMudXBkYXRlTWVzc2FnZS5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm93c01heDogNlxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hZGRpdGlvbmFsUGFuZUJvdHRvbSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAncmlnaHQnLCBwYWRkaW5nOiAnOHB4IDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkRpc21pc3MgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5nZXRNZXNzYWdlKCc1NCcsICcnKSwgb25Ub3VjaFRhcDogdGhpcy5wcm9wcy5vbkRpc21pc3MgfSksXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLm9uRGlzbWlzcyAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzIxNicsICcnKSwgb25Ub3VjaFRhcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzNC5zZXRTdGF0ZSh7IHVzZXJzOiB7fSwgc3ViamVjdDogJycsIG1lc3NhZ2U6ICcnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogcG9zdGluZywgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgnNzcnLCAnJyksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzNC5wb3N0RW1haWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub3ZlcmxheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5vdmVybGF5IH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYW5lO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblBhbmUuUHJvcFR5cGVzID0ge1xuICAgIG1lc3NhZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHN1YmplY3Q6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHRlbXBsYXRlSWQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHRlbXBsYXRlRGF0YTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgbGluazogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25EaXNtaXNzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgY2xhc3NOYW1lOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvdmVybGF5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgdW5pcXVlVXNlclN0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgdXNlcnM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIHBhbmVsVGl0bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHpEZXB0aDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5udW1iZXIsXG4gICAgc2hvd0FkZHJlc3NCb29rOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgcHJvY2Vzc1Bvc3Q6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICBhZGRpdGlvbmFsUGFuZVRvcDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpLFxuICAgIGFkZGl0aW9uYWxQYW5lQm90dG9tOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudClcbn07XG5cbnZhciBQcmVmZXJlbmNlc1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50NCkge1xuICAgIF9pbmhlcml0cyhQcmVmZXJlbmNlc1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50NCk7XG5cbiAgICBmdW5jdGlvbiBQcmVmZXJlbmNlc1BhbmVsKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHJlZmVyZW5jZXNQYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHJlZmVyZW5jZXNQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQcmVmZXJlbmNlc1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgJ1ByZWZlcmVuY2VzIFBhbmVsJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQcmVmZXJlbmNlc1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUGFuZSA9IFBhbmU7XG5leHBvcnRzLlByZWZlcmVuY2VzUGFuZWwgPSBQcmVmZXJlbmNlc1BhbmVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHNcIik7XG5cbmV4cG9ydHMuUGFuZSA9IF9jb21wb25lbnRzLlBhbmU7XG5leHBvcnRzLlByZWZlcmVuY2VzUGFuZWwgPSBfY29tcG9uZW50cy5QcmVmZXJlbmNlc1BhbmVsO1xuIl19
