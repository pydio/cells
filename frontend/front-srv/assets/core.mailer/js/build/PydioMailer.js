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
                    _this2.props.onDismiss();
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
                    { style: { padding: 20, color: 'rgba(0,0,0,0.87)', fontSize: 25, marginBottom: 0, paddingBottom: 10 } },
                    this.props.panelTitle
                ),
                errorDiv,
                this.props.additionalPaneTop,
                !this.props.uniqueUserStyle && _react2['default'].createElement(
                    'div',
                    { className: 'users-block', style: { padding: '0 20px' } },
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
                    { style: { padding: '0 20px' } },
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
                    _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('54', ''), onTouchTap: this.props.onDismiss }),
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9jb21wb25lbnRzLmpzIiwianMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2dCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDEwLCBfeDExLCBfeDEyKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MTAsIHByb3BlcnR5ID0gX3gxMSwgcmVjZWl2ZXIgPSBfeDEyOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MTAgPSBwYXJlbnQ7IF94MTEgPSBwcm9wZXJ0eTsgX3gxMiA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBzdHlsZXMgPSB7XG4gICAgY2hpcDoge1xuICAgICAgICBtYXJnaW5SaWdodDogNCxcbiAgICAgICAgbWFyZ2luQm90dG9tOiA0XG4gICAgfSxcbiAgICB3cmFwcGVyOiB7XG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgZmxleFdyYXA6ICd3cmFwJ1xuICAgIH0sXG4gICAgb3ZlcmxheToge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuMzMpJyxcbiAgICAgICAgcGFkZGluZ1RvcDogNzcsXG4gICAgICAgIHpJbmRleDogMTAwXG4gICAgfVxufTtcblxudmFyIERlc3RCYWRnZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEZXN0QmFkZ2UsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRGVzdEJhZGdlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGVzdEJhZGdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEZXN0QmFkZ2UucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRGVzdEJhZGdlLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSB0aGlzLnByb3BzLnVzZXI7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwic2hhcmUtZGlhbG9nIHVzZXItYmFkZ2UgdXNlci10eXBlLVwiICsgKHVzZXJPYmplY3QuZ2V0VGVtcG9yYXJ5KCkgPyBcInRtcF91c2VyXCIgOiBcInVzZXJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBcImF2YXRhciBpY29uLVwiICsgKHVzZXJPYmplY3QuZ2V0VGVtcG9yYXJ5KCkgPyBcImVudmVsb3BlXCIgOiBcInVzZXJcIikgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2VyLWJhZGdlLWxhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICB1c2VyT2JqZWN0LmdldEV4dGVuZGVkTGFiZWwoKSB8fCB1c2VyT2JqZWN0LmdldExhYmVsKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERlc3RCYWRnZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgVXNlckNoaXAgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKFVzZXJDaGlwLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBVc2VyQ2hpcCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVzZXJDaGlwKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyQ2hpcC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyQ2hpcCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfcHJvcHMgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIHVzZXIgPSBfcHJvcHMudXNlcjtcbiAgICAgICAgICAgIHZhciBvblJlbW92ZSA9IF9wcm9wcy5vblJlbW92ZTtcblxuICAgICAgICAgICAgdmFyIHRtcCA9IHVzZXIuRnJlZVZhbHVlO1xuICAgICAgICAgICAgdmFyIGxhYmVsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRtcCkge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gdXNlci5GcmVlVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLkF0dHJpYnV0ZXMgJiYgdXNlci5BdHRyaWJ1dGVzWydkaXNwbGF5TmFtZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gdXNlci5BdHRyaWJ1dGVzWydkaXNwbGF5TmFtZSddO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsID0gdXNlci5Mb2dpbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRm9udEljb24sIHsgY2xhc3NOYW1lOiBcImljb24tXCIgKyAodG1wID8gXCJlbnZlbG9wZVwiIDogXCJ1c2VyXCIpIH0pO1xuICAgICAgICAgICAgdmFyIGNvbG9ycyA9IF9tYXRlcmlhbFVpLlN0eWxlLmNvbG9ycztcblxuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLkNoaXAsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRtcCA/IGNvbG9ycy5saWdodEJsdWUxMDAgOiBjb2xvcnMuYmx1ZUdyZXkxMDAsXG4gICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdERlbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25SZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHN0eWxlcy5jaGlwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5BdmF0YXIsIHsgaWNvbjogaWNvbiwgY29sb3I6IHRtcCA/ICd3aGl0ZScgOiBjb2xvcnMuYmx1ZUdyZXk2MDAsIGJhY2tncm91bmRDb2xvcjogdG1wID8gY29sb3JzLmxpZ2h0Qmx1ZTMwMCA6IGNvbG9ycy5ibHVlR3JleTMwMCB9KSxcbiAgICAgICAgICAgICAgICBsYWJlbFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBVc2VyQ2hpcDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgRW1haWwgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEVtYWlsKCkge1xuICAgICAgICB2YXIgc3ViamVjdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG4gICAgICAgIHZhciBtZXNzYWdlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgdmFyIGxpbmsgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzJdO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFbWFpbCk7XG5cbiAgICAgICAgdGhpcy5fc3ViamVjdHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbWVzc2FnZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fdGFyZ2V0cyA9IFtdO1xuICAgICAgICB0aGlzLl9saW5rcyA9IFtdO1xuICAgICAgICB0aGlzLnRlbXBsYXRlSWQgPSBcIlwiO1xuICAgICAgICB0aGlzLnRlbXBsYXRlRGF0YSA9IHt9O1xuICAgICAgICBpZiAoc3ViamVjdCkge1xuICAgICAgICAgICAgdGhpcy5fc3ViamVjdHMucHVzaChzdWJqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgICAgdGhpcy5fbGlua3MucHVzaChsaW5rKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhFbWFpbCwgW3tcbiAgICAgICAga2V5OiAnYWRkVGFyZ2V0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFRhcmdldCh1c2VyT3JFbWFpbCkge1xuICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzJdO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgICAgICAgICB0aGlzLl90YXJnZXRzLnB1c2godXNlck9yRW1haWwpO1xuICAgICAgICAgICAgaWYgKHN1YmplY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWJqZWN0cy5wdXNoKHN1YmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9saW5rcy5wdXNoKGxpbmspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRUZW1wbGF0ZURhdGEnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VGVtcGxhdGVEYXRhKHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSkge1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZUlkID0gdGVtcGxhdGVJZDtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXRzIEFycmF5XG4gICAgICAgICAqIEBwYXJhbSBzdWJqZWN0IHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVJZCBzdHJpbmdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlRGF0YSBPYmplY3RcbiAgICAgICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb3N0T25lJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvc3RPbmUodGFyZ2V0cywgc3ViamVjdCwgdGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSB7XG4gICAgICAgICAgICB2YXIgYXBpID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLk1haWxlclNlcnZpY2VBcGkoX3B5ZGlvSHR0cEFwaTJbJ2RlZmF1bHQnXS5nZXRSZXN0Q2xpZW50KCkpO1xuICAgICAgICAgICAgdmFyIGVtYWlsID0gbmV3IF9weWRpb0h0dHBSZXN0QXBpLk1haWxlck1haWwoKTtcbiAgICAgICAgICAgIGVtYWlsLlN1YmplY3QgPSBzdWJqZWN0O1xuICAgICAgICAgICAgZW1haWwuVG8gPSB0YXJnZXRzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcHlkaW9IdHRwUmVzdEFwaS5NYWlsZXJVc2VyLmNvbnN0cnVjdEZyb21PYmplY3QoeyBVdWlkOiB0IH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbWFpbC5UZW1wbGF0ZUlkID0gdGVtcGxhdGVJZDtcbiAgICAgICAgICAgIGVtYWlsLlRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgICAgIHJldHVybiBhcGkuc2VuZChlbWFpbCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bvc3QnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9zdCgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fc3ViamVjdHMubGVuZ3RoICYmICF0aGlzLnRlbXBsYXRlSWQgfHwgIXRoaXMuX3RhcmdldHMubGVuZ3RoIHx8ICF0aGlzLl9tZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRGF0YSA9IF9leHRlbmRzKHt9LCB0aGlzLnRlbXBsYXRlRGF0YSk7XG4gICAgICAgICAgICB2YXIgcHJvbXMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA+IDEgJiYgdGhpcy5fbWVzc2FnZXMubGVuZ3RoID09PSB0aGlzLl90YXJnZXRzLmxlbmd0aCAmJiB0aGlzLl9zdWJqZWN0cy5sZW5ndGggPT09IHRoaXMuX3RhcmdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZCBhcyBtYW55IGVtYWlscyBhcyB0YXJnZXRzIHdpdGggdGhlaXIgb3duIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgdGhpcy5fdGFyZ2V0cy5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfdGhpcy5fc3ViamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YSA9IF9leHRlbmRzKHt9LCB0ZW1wbGF0ZURhdGEsIHsgTWVzc2FnZTogX3RoaXMuX21lc3NhZ2VzW2ldIH0pO1xuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKF90aGlzLnBvc3RPbmUoW3RdLCBzdWJqZWN0LCBfdGhpcy50ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSB0aGlzLl9zdWJqZWN0c1swXTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbJ01lc3NhZ2UnXSA9IHRoaXMuX21lc3NhZ2VzWzBdO1xuICAgICAgICAgICAgICAgIHByb21zLnB1c2godGhpcy5wb3N0T25lKHRoaXMuX3RhcmdldHMsIHN1YmplY3QsIHRoaXMudGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRW1haWw7XG59KSgpO1xuXG52YXIgUGFuZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDMpIHtcbiAgICBfaW5oZXJpdHMoUGFuZSwgX1JlYWN0JENvbXBvbmVudDMpO1xuXG4gICAgZnVuY3Rpb24gUGFuZShwcm9wcykge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUGFuZSk7XG5cbiAgICAgICAgaWYgKHByb3BzLnNob3dBZGRyZXNzQm9vayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwcm9wcy5zaG93QWRkcmVzc0Jvb2sgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFBhbmUucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzLCBwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB1c2VyczogdGhpcy5wcm9wcy51c2VycyB8fCB7fSxcbiAgICAgICAgICAgIHN1YmplY3Q6IHRoaXMucHJvcHMuc3ViamVjdCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMucHJvcHMubWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogbnVsbCxcbiAgICAgICAgICAgIHBvc3Rpbmc6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFBhbmUsIFt7XG4gICAgICAgIGtleTogJ3VwZGF0ZVN1YmplY3QnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlU3ViamVjdChldmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1YmplY3Q6IGV2ZW50LmN1cnJlbnRUYXJnZXQudmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3VwZGF0ZU1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlTWVzc2FnZShldmVudCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2U6IGV2ZW50LmN1cnJlbnRUYXJnZXQudmFsdWUgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2FkZFVzZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVXNlcih1c2VyT2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSB0aGlzLnN0YXRlLnVzZXJzO1xuXG4gICAgICAgICAgICBpZiAodXNlck9iamVjdC5GcmVlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB1c2Vyc1t1c2VyT2JqZWN0LkZyZWVWYWx1ZV0gPSB1c2VyT2JqZWN0O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1c2VyT2JqZWN0LklkbVVzZXIpIHtcbiAgICAgICAgICAgICAgICB1c2Vyc1t1c2VyT2JqZWN0LklkbVVzZXIuTG9naW5dID0gdXNlck9iamVjdC5JZG1Vc2VyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJzOiB1c2VycywgZXJyb3JNZXNzYWdlOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVVc2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVVzZXIodXNlcklkKSB7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSB0aGlzLnN0YXRlLnVzZXJzO1xuXG4gICAgICAgICAgICBkZWxldGUgdXNlcnNbdXNlcklkXTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VyczogdXNlcnMgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgICAgIHZhciBuYW1lU3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWVTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVTcGFjZSA9ICdjb3JlLm1haWxlcic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuYW1lU3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZVNwYWNlICs9IFwiLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbbmFtZVNwYWNlICsgbWVzc2FnZUlkXTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb3N0RW1haWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9zdEVtYWlsKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciByZXBvc3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gX3N0YXRlLnVzZXJzO1xuICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfc3RhdGUuc3ViamVjdDtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gX3N0YXRlLm1lc3NhZ2U7XG5cbiAgICAgICAgICAgIGlmICghcmVwb3N0ICYmIHRoaXMucmVmcy5jb21wbGV0ZXIgJiYgdGhpcy5yZWZzLmNvbXBsZXRlci5nZXRQZW5kaW5nU2VhcmNoVGV4dCAmJiB0aGlzLnJlZnMuY29tcGxldGVyLmdldFBlbmRpbmdTZWFyY2hUZXh0KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnMuY29tcGxldGVyLm9uQ29tcGxldGVyUmVxdWVzdCh0aGlzLnJlZnMuY29tcGxldGVyLmdldFBlbmRpbmdTZWFyY2hUZXh0KCksIC0xKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5wb3N0RW1haWwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHVzZXJzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3JNZXNzYWdlOiB0aGlzLmdldE1lc3NhZ2UoMikgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIF9wcm9wczIgPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBfcHJvcHMyLmxpbms7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVJZCA9IF9wcm9wczIudGVtcGxhdGVJZDtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBfcHJvcHMyLnRlbXBsYXRlRGF0YTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gY2FsbGJhY2socmVzKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLnNldFN0YXRlKHsgcG9zdGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpczIucHJvcHMub25EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwb3N0aW5nOiB0cnVlIH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5wcm9jZXNzUG9zdCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucHJvY2Vzc1Bvc3QoRW1haWwsIHVzZXJzLCBzdWJqZWN0LCBtZXNzYWdlLCBsaW5rLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZW1haWwgPSBuZXcgRW1haWwoc3ViamVjdCwgbWVzc2FnZSwgbGluayB8fCBudWxsKTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHVzZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgZW1haWwuYWRkVGFyZ2V0KGspO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGVJZCkge1xuICAgICAgICAgICAgICAgIGVtYWlsLnNldFRlbXBsYXRlRGF0YSh0ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW1haWwucG9zdChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIF9zdGF0ZTIgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gX3N0YXRlMi51c2VycztcbiAgICAgICAgICAgIHZhciBwb3N0aW5nID0gX3N0YXRlMi5wb3N0aW5nO1xuICAgICAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IF9zdGF0ZTIuZXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfc3RhdGUyLnN1YmplY3Q7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IF9zdGF0ZTIubWVzc2FnZTtcblxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IFt0aGlzLnByb3BzLmNsYXNzTmFtZSwgXCJyZWFjdC1tYWlsZXJcIiwgXCJyZXNldC1weWRpby1mb3Jtc1wiXS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgIHZhciB1c2Vyc0NoaXBzID0gT2JqZWN0LmtleXModXNlcnMpLm1hcCgoZnVuY3Rpb24gKHVJZCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJDaGlwLCB7IGtleTogdUlkLCB1c2VyOiB1c2Vyc1t1SWRdLCBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMzLnJlbW92ZVVzZXIodUlkKTtcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdmFyIGVycm9yRGl2ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKGVycm9yTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGVycm9yRGl2ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcxMHB4IDIwcHgnLCBjb2xvcjogJ3JlZCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0eWxlID0gX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIG1hcmdpbjogdGhpcy5wcm9wcy51bmlxdWVVc2VyU3R5bGUgPyAwIDogOFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5zdHlsZSk7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlBhcGVyLFxuICAgICAgICAgICAgICAgIHsgekRlcHRoOiB0aGlzLnByb3BzLnpEZXB0aCAhPT0gdW5kZWZpbmVkID8gdGhpcy5wcm9wcy56RGVwdGggOiAyLCBjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHN0eWxlIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdoMycsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogMjAsIGNvbG9yOiAncmdiYSgwLDAsMCwwLjg3KScsIGZvbnRTaXplOiAyNSwgbWFyZ2luQm90dG9tOiAwLCBwYWRkaW5nQm90dG9tOiAxMCB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucGFuZWxUaXRsZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgZXJyb3JEaXYsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hZGRpdGlvbmFsUGFuZVRvcCxcbiAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy51bmlxdWVVc2VyU3R5bGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IGNsYXNzTmFtZTogJ3VzZXJzLWJsb2NrJywgc3R5bGU6IHsgcGFkZGluZzogJzAgMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudHMuVXNlcnNDb21wbGV0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ2NvbXBsZXRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZExhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyZWVWYWx1ZUFsbG93ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbHVlU2VsZWN0ZWQ6IHRoaXMuYWRkVXNlci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjbHVkZXM6IE9iamVjdC5rZXlzKHVzZXJzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlclN1Z2dlc3Rpb246IGZ1bmN0aW9uICh1c2VyT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KERlc3RCYWRnZSwgeyB1c2VyOiB1c2VyT2JqZWN0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB5ZGlvOiBweWRpbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRyZXNzQm9vazogdGhpcy5wcm9wcy5zaG93QWRkcmVzc0Jvb2ssXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlcmxpbmVIaWRlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogc3R5bGVzLndyYXBwZXIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJzQ2hpcHNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgIXRoaXMucHJvcHMudW5pcXVlVXNlclN0eWxlICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnRlbXBsYXRlSWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmdldE1lc3NhZ2UoJzYnKSwgdmFsdWU6IHN1YmplY3QsIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZVN1YmplY3QuYmluZCh0aGlzKSB9KVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgIXRoaXMucHJvcHMudGVtcGxhdGVJZCAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzAgMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuZ2V0TWVzc2FnZSgnNycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtdWx0aUxpbmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy51cGRhdGVNZXNzYWdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dzTWF4OiA2XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFkZGl0aW9uYWxQYW5lQm90dG9tLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyB0ZXh0QWxpZ246ICdyaWdodCcsIHBhZGRpbmc6ICc4cHggMjBweCcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzU0JywgJycpLCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uRGlzbWlzcyB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBkaXNhYmxlZDogcG9zdGluZywgcHJpbWFyeTogdHJ1ZSwgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgnNzcnLCAnJyksIG9uVG91Y2hUYXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzNC5wb3N0RW1haWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub3ZlcmxheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy5vdmVybGF5IH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQYW5lO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cblBhbmUuUHJvcFR5cGVzID0ge1xuICAgIG1lc3NhZ2U6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHN1YmplY3Q6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHRlbXBsYXRlSWQ6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHRlbXBsYXRlRGF0YTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5vYmplY3QsXG4gICAgbGluazogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25EaXNtaXNzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgY2xhc3NOYW1lOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvdmVybGF5OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgdW5pcXVlVXNlclN0eWxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgdXNlcnM6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIHBhbmVsVGl0bGU6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHpEZXB0aDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5udW1iZXIsXG4gICAgc2hvd0FkZHJlc3NCb29rOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmJvb2wsXG4gICAgcHJvY2Vzc1Bvc3Q6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuZnVuYyxcbiAgICBhZGRpdGlvbmFsUGFuZVRvcDogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpLFxuICAgIGFkZGl0aW9uYWxQYW5lQm90dG9tOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmluc3RhbmNlT2YoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudClcbn07XG5cbnZhciBQcmVmZXJlbmNlc1BhbmVsID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50NCkge1xuICAgIF9pbmhlcml0cyhQcmVmZXJlbmNlc1BhbmVsLCBfUmVhY3QkQ29tcG9uZW50NCk7XG5cbiAgICBmdW5jdGlvbiBQcmVmZXJlbmNlc1BhbmVsKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUHJlZmVyZW5jZXNQYW5lbCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUHJlZmVyZW5jZXNQYW5lbC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhQcmVmZXJlbmNlc1BhbmVsLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgJ1ByZWZlcmVuY2VzIFBhbmVsJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBQcmVmZXJlbmNlc1BhbmVsO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbmV4cG9ydHMuUGFuZSA9IFBhbmU7XG5leHBvcnRzLlByZWZlcmVuY2VzUGFuZWwgPSBQcmVmZXJlbmNlc1BhbmVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY29tcG9uZW50cyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHNcIik7XG5cbmV4cG9ydHMuUGFuZSA9IF9jb21wb25lbnRzLlBhbmU7XG5leHBvcnRzLlByZWZlcmVuY2VzUGFuZWwgPSBfY29tcG9uZW50cy5QcmVmZXJlbmNlc1BhbmVsO1xuIl19
