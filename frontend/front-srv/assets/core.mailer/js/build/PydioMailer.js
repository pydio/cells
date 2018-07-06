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
        key: 'remove',
        value: function remove() {
            this.props.onRemove(this.props.user.getId());
        }
    }, {
        key: 'render',
        value: function render() {
            var tmp = this.props.user.getTemporary();
            var icon = _react2['default'].createElement(MaterialUI.FontIcon, { className: "icon-" + (tmp ? "envelope" : "user") });
            var colors = MaterialUI.Style.colors;

            return _react2['default'].createElement(
                MaterialUI.Chip,
                {
                    backgroundColor: tmp ? colors.lightBlue100 : colors.blueGrey100,
                    onRequestDelete: this.remove.bind(this),
                    style: styles.chip
                },
                _react2['default'].createElement(MaterialUI.Avatar, { icon: icon, color: tmp ? 'white' : colors.blueGrey600, backgroundColor: tmp ? colors.lightBlue300 : colors.blueGrey300 }),
                this.props.user.getLabel()
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
            // Todo : Handle links?

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
            errorMessage: null
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

            users[userObject.getId()] = userObject;
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
            var _props = this.props;
            var link = _props.link;
            var templateId = _props.templateId;
            var templateData = _props.templateData;

            var callback = function callback(res) {
                if (res) {
                    _this2.props.onDismiss();
                }
            };
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
            var _this3 = this;

            var className = [this.props.className, "react-mailer", "reset-pydio-forms"].join(" ");
            var users = Object.keys(this.state.users).map((function (uId) {
                return _react2['default'].createElement(UserChip, { key: uId, user: this.state.users[uId], onRemove: this.removeUser.bind(this) });
            }).bind(this));
            var errorDiv = undefined;
            if (this.state.errorMessage) {
                errorDiv = _react2['default'].createElement(
                    'div',
                    { style: { padding: '10px 20px', color: 'red' } },
                    this.state.errorMessage
                );
            }
            var style = _extends({
                margin: this.props.uniqueUserStyle ? 0 : 8
            }, this.props.style);
            var content = _react2['default'].createElement(
                MaterialUI.Paper,
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
                        excludes: Object.keys(this.state.users),
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
                        users
                    )
                ),
                !this.props.uniqueUserStyle && _react2['default'].createElement(MaterialUI.Divider, null),
                !this.props.templateId && _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    _react2['default'].createElement(MaterialUI.TextField, { fullWidth: true, underlineShow: false, floatingLabelText: this.getMessage('6'), value: this.state.subject, onChange: this.updateSubject.bind(this) })
                ),
                !this.props.templateId && _react2['default'].createElement(MaterialUI.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    _react2['default'].createElement(MaterialUI.TextField, {
                        fullWidth: true,
                        underlineShow: false,
                        floatingLabelText: this.getMessage('7'),
                        value: this.state.message,
                        multiLine: true,
                        onChange: this.updateMessage.bind(this),
                        rowsMax: 6
                    })
                ),
                this.props.additionalPaneBottom,
                _react2['default'].createElement(MaterialUI.Divider, null),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'right', padding: '8px 20px' } },
                    _react2['default'].createElement(MaterialUI.FlatButton, { label: this.getMessage('54', ''), onTouchTap: this.props.onDismiss }),
                    _react2['default'].createElement(MaterialUI.FlatButton, { primary: true, label: this.getMessage('77', ''), onTouchTap: function (e) {
                            return _this3.postEmail();
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

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _components = require("./components");

exports.Pane = _components.Pane;
exports.PreferencesPanel = _components.PreferencesPanel;

},{"./components":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9idWlsZC9jb21wb25lbnRzLmpzIiwianMvYnVpbGQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDEwLCBfeDExLCBfeDEyKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MTAsIHByb3BlcnR5ID0gX3gxMSwgcmVjZWl2ZXIgPSBfeDEyOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MTAgPSBwYXJlbnQ7IF94MTEgPSBwcm9wZXJ0eTsgX3gxMiA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9weWRpb0h0dHBBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xuXG52YXIgX3B5ZGlvSHR0cEFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb0h0dHBBcGkpO1xuXG52YXIgX3B5ZGlvSHR0cFJlc3RBcGkgPSByZXF1aXJlKCdweWRpby9odHRwL3Jlc3QtYXBpJyk7XG5cbnZhciBzdHlsZXMgPSB7XG4gICAgY2hpcDoge1xuICAgICAgICBtYXJnaW5SaWdodDogNCxcbiAgICAgICAgbWFyZ2luQm90dG9tOiA0XG4gICAgfSxcbiAgICB3cmFwcGVyOiB7XG4gICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICAgICAgZmxleFdyYXA6ICd3cmFwJ1xuICAgIH0sXG4gICAgb3ZlcmxheToge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgdG9wOiAwLFxuICAgICAgICByaWdodDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuMzMpJyxcbiAgICAgICAgcGFkZGluZ1RvcDogNzcsXG4gICAgICAgIHpJbmRleDogMTAwXG4gICAgfVxufTtcblxudmFyIERlc3RCYWRnZSA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICAgIF9pbmhlcml0cyhEZXN0QmFkZ2UsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gICAgZnVuY3Rpb24gRGVzdEJhZGdlKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRGVzdEJhZGdlKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihEZXN0QmFkZ2UucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRGVzdEJhZGdlLCBbe1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIHVzZXJPYmplY3QgPSB0aGlzLnByb3BzLnVzZXI7XG4gICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6IFwic2hhcmUtZGlhbG9nIHVzZXItYmFkZ2UgdXNlci10eXBlLVwiICsgKHVzZXJPYmplY3QuZ2V0VGVtcG9yYXJ5KCkgPyBcInRtcF91c2VyXCIgOiBcInVzZXJcIikgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudCgnc3BhbicsIHsgY2xhc3NOYW1lOiBcImF2YXRhciBpY29uLVwiICsgKHVzZXJPYmplY3QuZ2V0VGVtcG9yYXJ5KCkgPyBcImVudmVsb3BlXCIgOiBcInVzZXJcIikgfSksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgeyBjbGFzc05hbWU6ICd1c2VyLWJhZGdlLWxhYmVsJyB9LFxuICAgICAgICAgICAgICAgICAgICB1c2VyT2JqZWN0LmdldEV4dGVuZGVkTGFiZWwoKSB8fCB1c2VyT2JqZWN0LmdldExhYmVsKClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIERlc3RCYWRnZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG52YXIgVXNlckNoaXAgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQyKSB7XG4gICAgX2luaGVyaXRzKFVzZXJDaGlwLCBfUmVhY3QkQ29tcG9uZW50Mik7XG5cbiAgICBmdW5jdGlvbiBVc2VyQ2hpcCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFVzZXJDaGlwKTtcblxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihVc2VyQ2hpcC5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVc2VyQ2hpcCwgW3tcbiAgICAgICAga2V5OiAncmVtb3ZlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy51c2VyLmdldElkKCkpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIHRtcCA9IHRoaXMucHJvcHMudXNlci5nZXRUZW1wb3JhcnkoKTtcbiAgICAgICAgICAgIHZhciBpY29uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5Gb250SWNvbiwgeyBjbGFzc05hbWU6IFwiaWNvbi1cIiArICh0bXAgPyBcImVudmVsb3BlXCIgOiBcInVzZXJcIikgfSk7XG4gICAgICAgICAgICB2YXIgY29sb3JzID0gTWF0ZXJpYWxVSS5TdHlsZS5jb2xvcnM7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBNYXRlcmlhbFVJLkNoaXAsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHRtcCA/IGNvbG9ycy5saWdodEJsdWUxMDAgOiBjb2xvcnMuYmx1ZUdyZXkxMDAsXG4gICAgICAgICAgICAgICAgICAgIG9uUmVxdWVzdERlbGV0ZTogdGhpcy5yZW1vdmUuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHN0eWxlcy5jaGlwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChNYXRlcmlhbFVJLkF2YXRhciwgeyBpY29uOiBpY29uLCBjb2xvcjogdG1wID8gJ3doaXRlJyA6IGNvbG9ycy5ibHVlR3JleTYwMCwgYmFja2dyb3VuZENvbG9yOiB0bXAgPyBjb2xvcnMubGlnaHRCbHVlMzAwIDogY29sb3JzLmJsdWVHcmV5MzAwIH0pLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudXNlci5nZXRMYWJlbCgpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFVzZXJDaGlwO1xufSkoX3JlYWN0MlsnZGVmYXVsdCddLkNvbXBvbmVudCk7XG5cbnZhciBFbWFpbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRW1haWwoKSB7XG4gICAgICAgIHZhciBzdWJqZWN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuICAgICAgICB2YXIgbGluayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVtYWlsKTtcblxuICAgICAgICB0aGlzLl9zdWJqZWN0cyA9IFtdO1xuICAgICAgICB0aGlzLl9tZXNzYWdlcyA9IFtdO1xuICAgICAgICB0aGlzLl90YXJnZXRzID0gW107XG4gICAgICAgIHRoaXMuX2xpbmtzID0gW107XG4gICAgICAgIHRoaXMudGVtcGxhdGVJZCA9IFwiXCI7XG4gICAgICAgIHRoaXMudGVtcGxhdGVEYXRhID0ge307XG4gICAgICAgIGlmIChzdWJqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLl9zdWJqZWN0cy5wdXNoKHN1YmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgICB0aGlzLl9saW5rcy5wdXNoKGxpbmspO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEVtYWlsLCBbe1xuICAgICAgICBrZXk6ICdhZGRUYXJnZXQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVGFyZ2V0KHVzZXJPckVtYWlsKSB7XG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMl07XG4gICAgICAgICAgICB2YXIgbGluayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbM107XG5cbiAgICAgICAgICAgIHRoaXMuX3RhcmdldHMucHVzaCh1c2VyT3JFbWFpbCk7XG4gICAgICAgICAgICBpZiAoc3ViamVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N1YmplY3RzLnB1c2goc3ViamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpbmtzLnB1c2gobGluayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFRlbXBsYXRlRGF0YScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRUZW1wbGF0ZURhdGEodGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlSWQgPSB0ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHRhcmdldHMgQXJyYXlcbiAgICAgICAgICogQHBhcmFtIHN1YmplY3Qgc3RyaW5nXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZUlkIHN0cmluZ1xuICAgICAgICAgKiBAcGFyYW0gdGVtcGxhdGVEYXRhIE9iamVjdFxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bvc3RPbmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9zdE9uZSh0YXJnZXRzLCBzdWJqZWN0LCB0ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIHZhciBhcGkgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgZW1haWwgPSBuZXcgX3B5ZGlvSHR0cFJlc3RBcGkuTWFpbGVyTWFpbCgpO1xuICAgICAgICAgICAgZW1haWwuU3ViamVjdCA9IHN1YmplY3Q7XG4gICAgICAgICAgICBlbWFpbC5UbyA9IHRhcmdldHMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9weWRpb0h0dHBSZXN0QXBpLk1haWxlclVzZXIuY29uc3RydWN0RnJvbU9iamVjdCh7IFV1aWQ6IHQgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVtYWlsLlRlbXBsYXRlSWQgPSB0ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgZW1haWwuVGVtcGxhdGVEYXRhID0gdGVtcGxhdGVEYXRhO1xuICAgICAgICAgICAgcmV0dXJuIGFwaS5zZW5kKGVtYWlsKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9zdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb3N0KCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl9zdWJqZWN0cy5sZW5ndGggJiYgIXRoaXMudGVtcGxhdGVJZCB8fCAhdGhpcy5fdGFyZ2V0cy5sZW5ndGggfHwgIXRoaXMuX21lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBkYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0gX2V4dGVuZHMoe30sIHRoaXMudGVtcGxhdGVEYXRhKTtcbiAgICAgICAgICAgIHZhciBwcm9tcyA9IFtdO1xuICAgICAgICAgICAgLy8gVG9kbyA6IEhhbmRsZSBsaW5rcz9cblxuICAgICAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA+IDEgJiYgdGhpcy5fbWVzc2FnZXMubGVuZ3RoID09PSB0aGlzLl90YXJnZXRzLmxlbmd0aCAmJiB0aGlzLl9zdWJqZWN0cy5sZW5ndGggPT09IHRoaXMuX3RhcmdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZCBhcyBtYW55IGVtYWlscyBhcyB0YXJnZXRzIHdpdGggdGhlaXIgb3duIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgdGhpcy5fdGFyZ2V0cy5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfdGhpcy5fc3ViamVjdHNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YSA9IF9leHRlbmRzKHt9LCB0ZW1wbGF0ZURhdGEsIHsgTWVzc2FnZTogX3RoaXMuX21lc3NhZ2VzW2ldIH0pO1xuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKF90aGlzLnBvc3RPbmUoW3RdLCBzdWJqZWN0LCBfdGhpcy50ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YmplY3QgPSB0aGlzLl9zdWJqZWN0c1swXTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGFbJ01lc3NhZ2UnXSA9IHRoaXMuX21lc3NhZ2VzWzBdO1xuICAgICAgICAgICAgICAgIHByb21zLnB1c2godGhpcy5wb3N0T25lKHRoaXMuX3RhcmdldHMsIHN1YmplY3QsIHRoaXMudGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21zKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIEVtYWlsO1xufSkoKTtcblxudmFyIFBhbmUgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQzKSB7XG4gICAgX2luaGVyaXRzKFBhbmUsIF9SZWFjdCRDb21wb25lbnQzKTtcblxuICAgIGZ1bmN0aW9uIFBhbmUocHJvcHMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBhbmUpO1xuXG4gICAgICAgIGlmIChwcm9wcy5zaG93QWRkcmVzc0Jvb2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHMuc2hvd0FkZHJlc3NCb29rID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihQYW5lLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcywgcHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdXNlcnM6IHRoaXMucHJvcHMudXNlcnMgfHwge30sXG4gICAgICAgICAgICBzdWJqZWN0OiB0aGlzLnByb3BzLnN1YmplY3QsXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLnByb3BzLm1lc3NhZ2UsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IG51bGxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFuZSwgW3tcbiAgICAgICAga2V5OiAndXBkYXRlU3ViamVjdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTdWJqZWN0KGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3ViamVjdDogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlTWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVNZXNzYWdlKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZTogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkVXNlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRVc2VyKHVzZXJPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IHRoaXMuc3RhdGUudXNlcnM7XG5cbiAgICAgICAgICAgIHVzZXJzW3VzZXJPYmplY3QuZ2V0SWQoKV0gPSB1c2VyT2JqZWN0O1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJzOiB1c2VycywgZXJyb3JNZXNzYWdlOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmVVc2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVVzZXIodXNlcklkKSB7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSB0aGlzLnN0YXRlLnVzZXJzO1xuXG4gICAgICAgICAgICBkZWxldGUgdXNlcnNbdXNlcklkXTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB1c2VyczogdXNlcnMgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2dldE1lc3NhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlSWQpIHtcbiAgICAgICAgICAgIHZhciBuYW1lU3BhY2UgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWVTcGFjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVTcGFjZSA9ICdjb3JlLm1haWxlcic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuYW1lU3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZVNwYWNlICs9IFwiLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcHlkaW8uTWVzc2FnZUhhc2hbbmFtZVNwYWNlICsgbWVzc2FnZUlkXTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb3N0RW1haWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcG9zdEVtYWlsKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciByZXBvc3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgdmFyIHVzZXJzID0gX3N0YXRlLnVzZXJzO1xuICAgICAgICAgICAgdmFyIHN1YmplY3QgPSBfc3RhdGUuc3ViamVjdDtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gX3N0YXRlLm1lc3NhZ2U7XG5cbiAgICAgICAgICAgIGlmICghcmVwb3N0ICYmIHRoaXMucmVmcy5jb21wbGV0ZXIgJiYgdGhpcy5yZWZzLmNvbXBsZXRlci5nZXRQZW5kaW5nU2VhcmNoVGV4dCAmJiB0aGlzLnJlZnMuY29tcGxldGVyLmdldFBlbmRpbmdTZWFyY2hUZXh0KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnMuY29tcGxldGVyLm9uQ29tcGxldGVyUmVxdWVzdCh0aGlzLnJlZnMuY29tcGxldGVyLmdldFBlbmRpbmdTZWFyY2hUZXh0KCksIC0xKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzMi5wb3N0RW1haWwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHVzZXJzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3JNZXNzYWdlOiB0aGlzLmdldE1lc3NhZ2UoMikgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIF9wcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGluayA9IF9wcm9wcy5saW5rO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlSWQgPSBfcHJvcHMudGVtcGxhdGVJZDtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBfcHJvcHMudGVtcGxhdGVEYXRhO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiBjYWxsYmFjayhyZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMucHJvY2Vzc1Bvc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnByb2Nlc3NQb3N0KEVtYWlsLCB1c2Vycywgc3ViamVjdCwgbWVzc2FnZSwgbGluaywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGVtYWlsID0gbmV3IEVtYWlsKHN1YmplY3QsIG1lc3NhZ2UsIGxpbmsgfHwgbnVsbCk7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh1c2VycykuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgICAgIGVtYWlsLmFkZFRhcmdldChrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgICAgICAgICBlbWFpbC5zZXRUZW1wbGF0ZURhdGEodGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVtYWlsLnBvc3QoY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW5kZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBbdGhpcy5wcm9wcy5jbGFzc05hbWUsIFwicmVhY3QtbWFpbGVyXCIsIFwicmVzZXQtcHlkaW8tZm9ybXNcIl0uam9pbihcIiBcIik7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnVzZXJzKS5tYXAoKGZ1bmN0aW9uICh1SWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlckNoaXAsIHsga2V5OiB1SWQsIHVzZXI6IHRoaXMuc3RhdGUudXNlcnNbdUlkXSwgb25SZW1vdmU6IHRoaXMucmVtb3ZlVXNlci5iaW5kKHRoaXMpIH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB2YXIgZXJyb3JEaXYgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBlcnJvckRpdiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMTBweCAyMHB4JywgY29sb3I6ICdyZWQnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5lcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0eWxlID0gX2V4dGVuZHMoe1xuICAgICAgICAgICAgICAgIG1hcmdpbjogdGhpcy5wcm9wcy51bmlxdWVVc2VyU3R5bGUgPyAwIDogOFxuICAgICAgICAgICAgfSwgdGhpcy5wcm9wcy5zdHlsZSk7XG4gICAgICAgICAgICB2YXIgY29udGVudCA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIE1hdGVyaWFsVUkuUGFwZXIsXG4gICAgICAgICAgICAgICAgeyB6RGVwdGg6IHRoaXMucHJvcHMuekRlcHRoICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLnpEZXB0aCA6IDIsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2gzJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAyMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuODcpJywgZm9udFNpemU6IDI1LCBtYXJnaW5Cb3R0b206IDAsIHBhZGRpbmdCb3R0b206IDEwIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5wYW5lbFRpdGxlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBlcnJvckRpdixcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFkZGl0aW9uYWxQYW5lVG9wLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnVuaXF1ZVVzZXJTdHlsZSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlcnMtYmxvY2snLCBzdHlsZTogeyBwYWRkaW5nOiAnMCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFB5ZGlvQ29tcG9uZW50cy5Vc2Vyc0NvbXBsZXRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnY29tcGxldGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkTGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgnOCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcnNPbmx5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdPbmx5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJlZVZhbHVlQWxsb3dlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsdWVTZWxlY3RlZDogdGhpcy5hZGRVc2VyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNsdWRlczogT2JqZWN0LmtleXModGhpcy5zdGF0ZS51c2VycyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJTdWdnZXN0aW9uOiBmdW5jdGlvbiAodXNlck9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChEZXN0QmFkZ2UsIHsgdXNlcjogdXNlck9iamVjdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QWRkcmVzc0Jvb2s6IHRoaXMucHJvcHMuc2hvd0FkZHJlc3NCb29rLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lSGlkZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy53cmFwcGVyIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2Vyc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy51bmlxdWVVc2VyU3R5bGUgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy50ZW1wbGF0ZUlkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuVGV4dEZpZWxkLCB7IGZ1bGxXaWR0aDogdHJ1ZSwgdW5kZXJsaW5lU2hvdzogZmFsc2UsIGZsb2F0aW5nTGFiZWxUZXh0OiB0aGlzLmdldE1lc3NhZ2UoJzYnKSwgdmFsdWU6IHRoaXMuc3RhdGUuc3ViamVjdCwgb25DaGFuZ2U6IHRoaXMudXBkYXRlU3ViamVjdC5iaW5kKHRoaXMpIH0pXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy50ZW1wbGF0ZUlkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE1hdGVyaWFsVUkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmc6ICcwIDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5UZXh0RmllbGQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVybGluZVNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXRpbmdMYWJlbFRleHQ6IHRoaXMuZ2V0TWVzc2FnZSgnNycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZU1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NNYXg6IDZcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkaXRpb25hbFBhbmVCb3R0b20sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgdGV4dEFsaWduOiAncmlnaHQnLCBwYWRkaW5nOiAnOHB4IDIwcHgnIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5GbGF0QnV0dG9uLCB7IGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzU0JywgJycpLCBvblRvdWNoVGFwOiB0aGlzLnByb3BzLm9uRGlzbWlzcyB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTWF0ZXJpYWxVSS5GbGF0QnV0dG9uLCB7IHByaW1hcnk6IHRydWUsIGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzc3JywgJycpLCBvblRvdWNoVGFwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczMucG9zdEVtYWlsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMub3ZlcmxheSB9LFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFuZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QYW5lLlByb3BUeXBlcyA9IHtcbiAgICBtZXNzYWdlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICBzdWJqZWN0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICB0ZW1wbGF0ZUlkOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICB0ZW1wbGF0ZURhdGE6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIGxpbms6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uRGlzbWlzczogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5mdW5jLFxuICAgIGNsYXNzTmFtZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb3ZlcmxheTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuICAgIHVuaXF1ZVVzZXJTdHlsZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuICAgIHVzZXJzOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLm9iamVjdCxcbiAgICBwYW5lbFRpdGxlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLnN0cmluZyxcbiAgICB6RGVwdGg6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMubnVtYmVyLFxuICAgIHNob3dBZGRyZXNzQm9vazogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5ib29sLFxuICAgIHByb2Nlc3NQb3N0OiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmMsXG4gICAgYWRkaXRpb25hbFBhbmVUb3A6IF9yZWFjdDJbJ2RlZmF1bHQnXS5Qcm9wVHlwZXMuaW5zdGFuY2VPZihfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KSxcbiAgICBhZGRpdGlvbmFsUGFuZUJvdHRvbTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpXG59O1xuXG52YXIgUHJlZmVyZW5jZXNQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDQpIHtcbiAgICBfaW5oZXJpdHMoUHJlZmVyZW5jZXNQYW5lbCwgX1JlYWN0JENvbXBvbmVudDQpO1xuXG4gICAgZnVuY3Rpb24gUHJlZmVyZW5jZXNQYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByZWZlcmVuY2VzUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFByZWZlcmVuY2VzUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHJlZmVyZW5jZXNQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICdQcmVmZXJlbmNlcyBQYW5lbCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHJlZmVyZW5jZXNQYW5lbDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzLlBhbmUgPSBQYW5lO1xuZXhwb3J0cy5QcmVmZXJlbmNlc1BhbmVsID0gUHJlZmVyZW5jZXNQYW5lbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzXCIpO1xuXG5leHBvcnRzLlBhbmUgPSBfY29tcG9uZW50cy5QYW5lO1xuZXhwb3J0cy5QcmVmZXJlbmNlc1BhbmVsID0gX2NvbXBvbmVudHMuUHJlZmVyZW5jZXNQYW5lbDtcbiJdfQ==
