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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _cellsSdk = require('cells-sdk');

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
            var api = new _cellsSdk.MailerServiceApi(_pydioHttpApi2['default'].getRestClient());
            var email = new _cellsSdk.MailerMail();
            email.Subject = subject;
            email.To = targets.map(function (t) {
                return _cellsSdk.MailerUser.constructFromObject({ Uuid: t });
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
                if (e.response && e.response.body && e.response.body.Title) {
                    e = new Error(e.response.body.Title);
                }
                callback(false, e);
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

            var callback = function callback(res, err) {
                _this2.setState({ posting: false });
                if (res) {
                    _this2.props.pydio.UI.displayMessage('SUCCESS', _this2.props.pydio.MessageHash["core.mailer.1"].replace('%s', Object.keys(users).length));
                    if (_this2.props.onDismiss) {
                        _this2.props.onDismiss();
                    } else {
                        _this2.setState({ users: {}, subject: '', message: '' });
                    }
                } else {
                    _this2.props.pydio.UI.displayMessage('ERROR', _this2.props.pydio.MessageHash["core.mailer.sender.error"] + (err ? ' : ' + err.message : ''));
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
                    this.props.onDismiss && _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('54', ''), onClick: this.props.onDismiss }),
                    !this.props.onDismiss && _react2['default'].createElement(_materialUi.FlatButton, { label: this.getMessage('216', ''), onClick: function () {
                            _this4.setState({ users: {}, subject: '', message: '' });
                        } }),
                    _react2['default'].createElement(_materialUi.FlatButton, { disabled: posting, primary: true, label: this.getMessage('77', ''), onClick: function (e) {
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
    message: _propTypes2['default'].string,
    subject: _propTypes2['default'].string,
    templateId: _propTypes2['default'].string,
    templateData: _propTypes2['default'].object,
    link: _propTypes2['default'].string,
    onDismiss: _propTypes2['default'].func,
    className: _propTypes2['default'].string,
    overlay: _propTypes2['default'].bool,
    uniqueUserStyle: _propTypes2['default'].bool,
    users: _propTypes2['default'].object,
    panelTitle: _propTypes2['default'].string,
    zDepth: _propTypes2['default'].number,
    showAddressBook: _propTypes2['default'].bool,
    processPost: _propTypes2['default'].func,
    additionalPaneTop: _propTypes2['default'].instanceOf(_react2['default'].Component),
    additionalPaneBottom: _propTypes2['default'].instanceOf(_react2['default'].Component)
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

},{"cells-sdk":"cells-sdk","material-ui":"material-ui","prop-types":"prop-types","pydio/http/api":"pydio/http/api","react":"react"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _components = require("./components");

exports.Pane = _components.Pane;
exports.PreferencesPanel = _components.PreferencesPanel;

},{"./components":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2J1aWxkL2NvbXBvbmVudHMuanMiLCJqcy9idWlsZC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDEwLCBfeDExLCBfeDEyKSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MTAsIHByb3BlcnR5ID0gX3gxMSwgcmVjZWl2ZXIgPSBfeDEyOyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MTAgPSBwYXJlbnQ7IF94MTEgPSBwcm9wZXJ0eTsgX3gxMiA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfcHlkaW9IdHRwQXBpID0gcmVxdWlyZSgncHlkaW8vaHR0cC9hcGknKTtcblxudmFyIF9weWRpb0h0dHBBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9IdHRwQXBpKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIF9jZWxsc1NkayA9IHJlcXVpcmUoJ2NlbGxzLXNkaycpO1xuXG52YXIgc3R5bGVzID0ge1xuICAgIGNoaXA6IHtcbiAgICAgICAgbWFyZ2luUmlnaHQ6IDQsXG4gICAgICAgIG1hcmdpbkJvdHRvbTogNFxuICAgIH0sXG4gICAgd3JhcHBlcjoge1xuICAgICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICAgIGZsZXhXcmFwOiAnd3JhcCdcbiAgICB9LFxuICAgIG92ZXJsYXk6IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjMzKScsXG4gICAgICAgIHBhZGRpbmdUb3A6IDc3LFxuICAgICAgICB6SW5kZXg6IDEwMFxuICAgIH1cbn07XG5cbnZhciBEZXN0QmFkZ2UgPSAoZnVuY3Rpb24gKF9SZWFjdCRDb21wb25lbnQpIHtcbiAgICBfaW5oZXJpdHMoRGVzdEJhZGdlLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICAgIGZ1bmN0aW9uIERlc3RCYWRnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERlc3RCYWRnZSk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoRGVzdEJhZGdlLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKERlc3RCYWRnZSwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciB1c2VyT2JqZWN0ID0gdGhpcy5wcm9wcy51c2VyO1xuICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiBcInNoYXJlLWRpYWxvZyB1c2VyLWJhZGdlIHVzZXItdHlwZS1cIiArICh1c2VyT2JqZWN0LmdldFRlbXBvcmFyeSgpID8gXCJ0bXBfdXNlclwiIDogXCJ1c2VyXCIpIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCB7IGNsYXNzTmFtZTogXCJhdmF0YXIgaWNvbi1cIiArICh1c2VyT2JqZWN0LmdldFRlbXBvcmFyeSgpID8gXCJlbnZlbG9wZVwiIDogXCJ1c2VyXCIpIH0pLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlci1iYWRnZS1sYWJlbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgdXNlck9iamVjdC5nZXRFeHRlbmRlZExhYmVsKCkgfHwgdXNlck9iamVjdC5nZXRMYWJlbCgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEZXN0QmFkZ2U7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIFVzZXJDaGlwID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mikge1xuICAgIF9pbmhlcml0cyhVc2VyQ2hpcCwgX1JlYWN0JENvbXBvbmVudDIpO1xuXG4gICAgZnVuY3Rpb24gVXNlckNoaXAoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBVc2VyQ2hpcCk7XG5cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoVXNlckNoaXAucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoVXNlckNoaXAsIFt7XG4gICAgICAgIGtleTogJ3JlbmRlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgICAgICB2YXIgX3Byb3BzID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIHZhciB1c2VyID0gX3Byb3BzLnVzZXI7XG4gICAgICAgICAgICB2YXIgb25SZW1vdmUgPSBfcHJvcHMub25SZW1vdmU7XG5cbiAgICAgICAgICAgIHZhciB0bXAgPSB1c2VyLkZyZWVWYWx1ZTtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0bXApIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuRnJlZVZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlci5BdHRyaWJ1dGVzICYmIHVzZXIuQXR0cmlidXRlc1snZGlzcGxheU5hbWUnXSkge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuQXR0cmlidXRlc1snZGlzcGxheU5hbWUnXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbCA9IHVzZXIuTG9naW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaWNvbiA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZvbnRJY29uLCB7IGNsYXNzTmFtZTogXCJpY29uLVwiICsgKHRtcCA/IFwiZW52ZWxvcGVcIiA6IFwidXNlclwiKSB9KTtcbiAgICAgICAgICAgIHZhciBjb2xvcnMgPSBfbWF0ZXJpYWxVaS5TdHlsZS5jb2xvcnM7XG5cbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5DaGlwLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0bXAgPyBjb2xvcnMubGlnaHRCbHVlMTAwIDogY29sb3JzLmJsdWVHcmV5MTAwLFxuICAgICAgICAgICAgICAgICAgICBvblJlcXVlc3REZWxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZXMuY2hpcFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuQXZhdGFyLCB7IGljb246IGljb24sIGNvbG9yOiB0bXAgPyAnd2hpdGUnIDogY29sb3JzLmJsdWVHcmV5NjAwLCBiYWNrZ3JvdW5kQ29sb3I6IHRtcCA/IGNvbG9ycy5saWdodEJsdWUzMDAgOiBjb2xvcnMuYmx1ZUdyZXkzMDAgfSksXG4gICAgICAgICAgICAgICAgbGFiZWxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXNlckNoaXA7XG59KShfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KTtcblxudmFyIEVtYWlsID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBFbWFpbCgpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG4gICAgICAgIHZhciBsaW5rID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1syXTtcblxuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRW1haWwpO1xuXG4gICAgICAgIHRoaXMuX3N1YmplY3RzID0gW107XG4gICAgICAgIHRoaXMuX21lc3NhZ2VzID0gW107XG4gICAgICAgIHRoaXMuX3RhcmdldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fbGlua3MgPSBbXTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZUlkID0gXCJcIjtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZURhdGEgPSB7fTtcbiAgICAgICAgaWYgKHN1YmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YmplY3RzLnB1c2goc3ViamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX21lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgIHRoaXMuX2xpbmtzLnB1c2gobGluayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRW1haWwsIFt7XG4gICAgICAgIGtleTogJ2FkZFRhcmdldCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRUYXJnZXQodXNlck9yRW1haWwpIHtcbiAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1syXTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgICAgICAgdGhpcy5fdGFyZ2V0cy5wdXNoKHVzZXJPckVtYWlsKTtcbiAgICAgICAgICAgIGlmIChzdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3ViamVjdHMucHVzaChzdWJqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGlua3MucHVzaChsaW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnc2V0VGVtcGxhdGVEYXRhJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFRlbXBsYXRlRGF0YSh0ZW1wbGF0ZUlkLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudGVtcGxhdGVJZCA9IHRlbXBsYXRlSWQ7XG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlRGF0YSA9IHRlbXBsYXRlRGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0cyBBcnJheVxuICAgICAgICAgKiBAcGFyYW0gc3ViamVjdCBzdHJpbmdcbiAgICAgICAgICogQHBhcmFtIHRlbXBsYXRlSWQgc3RyaW5nXG4gICAgICAgICAqIEBwYXJhbSB0ZW1wbGF0ZURhdGEgT2JqZWN0XG4gICAgICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncG9zdE9uZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb3N0T25lKHRhcmdldHMsIHN1YmplY3QsIHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSkge1xuICAgICAgICAgICAgdmFyIGFwaSA9IG5ldyBfY2VsbHNTZGsuTWFpbGVyU2VydmljZUFwaShfcHlkaW9IdHRwQXBpMlsnZGVmYXVsdCddLmdldFJlc3RDbGllbnQoKSk7XG4gICAgICAgICAgICB2YXIgZW1haWwgPSBuZXcgX2NlbGxzU2RrLk1haWxlck1haWwoKTtcbiAgICAgICAgICAgIGVtYWlsLlN1YmplY3QgPSBzdWJqZWN0O1xuICAgICAgICAgICAgZW1haWwuVG8gPSB0YXJnZXRzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY2VsbHNTZGsuTWFpbGVyVXNlci5jb25zdHJ1Y3RGcm9tT2JqZWN0KHsgVXVpZDogdCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZW1haWwuVGVtcGxhdGVJZCA9IHRlbXBsYXRlSWQ7XG4gICAgICAgICAgICBlbWFpbC5UZW1wbGF0ZURhdGEgPSB0ZW1wbGF0ZURhdGE7XG4gICAgICAgICAgICByZXR1cm4gYXBpLnNlbmQoZW1haWwpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwb3N0JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvc3QoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3N1YmplY3RzLmxlbmd0aCAmJiAhdGhpcy50ZW1wbGF0ZUlkIHx8ICF0aGlzLl90YXJnZXRzLmxlbmd0aCB8fCAhdGhpcy5fbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBfZXh0ZW5kcyh7fSwgdGhpcy50ZW1wbGF0ZURhdGEpO1xuICAgICAgICAgICAgdmFyIHByb21zID0gW107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9tZXNzYWdlcy5sZW5ndGggPiAxICYmIHRoaXMuX21lc3NhZ2VzLmxlbmd0aCA9PT0gdGhpcy5fdGFyZ2V0cy5sZW5ndGggJiYgdGhpcy5fc3ViamVjdHMubGVuZ3RoID09PSB0aGlzLl90YXJnZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vIFNlbmQgYXMgbWFueSBlbWFpbHMgYXMgdGFyZ2V0cyB3aXRoIHRoZWlyIG93biBtZXNzYWdlc1xuICAgICAgICAgICAgICAgIHRoaXMuX3RhcmdldHMubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gX3RoaXMuX3N1YmplY3RzW2ldO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGEgPSBfZXh0ZW5kcyh7fSwgdGVtcGxhdGVEYXRhLCB7IE1lc3NhZ2U6IF90aGlzLl9tZXNzYWdlc1tpXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChfdGhpcy5wb3N0T25lKFt0XSwgc3ViamVjdCwgX3RoaXMudGVtcGxhdGVJZCwgdGVtcGxhdGVEYXRhKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBzdWJqZWN0ID0gdGhpcy5fc3ViamVjdHNbMF07XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVEYXRhWydNZXNzYWdlJ10gPSB0aGlzLl9tZXNzYWdlc1swXTtcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHRoaXMucG9zdE9uZSh0aGlzLl90YXJnZXRzLCBzdWJqZWN0LCB0aGlzLnRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChwcm9tcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLnJlc3BvbnNlICYmIGUucmVzcG9uc2UuYm9keSAmJiBlLnJlc3BvbnNlLmJvZHkuVGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZSA9IG5ldyBFcnJvcihlLnJlc3BvbnNlLmJvZHkuVGl0bGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBFbWFpbDtcbn0pKCk7XG5cbnZhciBQYW5lID0gKGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50Mykge1xuICAgIF9pbmhlcml0cyhQYW5lLCBfUmVhY3QkQ29tcG9uZW50Myk7XG5cbiAgICBmdW5jdGlvbiBQYW5lKHByb3BzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQYW5lKTtcblxuICAgICAgICBpZiAocHJvcHMuc2hvd0FkZHJlc3NCb29rID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByb3BzLnNob3dBZGRyZXNzQm9vayA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoUGFuZS5wcm90b3R5cGUpLCAnY29uc3RydWN0b3InLCB0aGlzKS5jYWxsKHRoaXMsIHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHVzZXJzOiB0aGlzLnByb3BzLnVzZXJzIHx8IHt9LFxuICAgICAgICAgICAgc3ViamVjdDogdGhpcy5wcm9wcy5zdWJqZWN0LFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5wcm9wcy5tZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBudWxsLFxuICAgICAgICAgICAgcG9zdGluZzogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUGFuZSwgW3tcbiAgICAgICAga2V5OiAndXBkYXRlU3ViamVjdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVTdWJqZWN0KGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3ViamVjdDogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAndXBkYXRlTWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVNZXNzYWdlKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWVzc2FnZTogZXZlbnQuY3VycmVudFRhcmdldC52YWx1ZSB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkVXNlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRVc2VyKHVzZXJPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IHRoaXMuc3RhdGUudXNlcnM7XG5cbiAgICAgICAgICAgIGlmICh1c2VyT2JqZWN0LkZyZWVWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHVzZXJzW3VzZXJPYmplY3QuRnJlZVZhbHVlXSA9IHVzZXJPYmplY3Q7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVzZXJPYmplY3QuSWRtVXNlcikge1xuICAgICAgICAgICAgICAgIHVzZXJzW3VzZXJPYmplY3QuSWRtVXNlci5Mb2dpbl0gPSB1c2VyT2JqZWN0LklkbVVzZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcnM6IHVzZXJzLCBlcnJvck1lc3NhZ2U6IG51bGwgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZVVzZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlVXNlcih1c2VySWQpIHtcbiAgICAgICAgICAgIHZhciB1c2VycyA9IHRoaXMuc3RhdGUudXNlcnM7XG5cbiAgICAgICAgICAgIGRlbGV0ZSB1c2Vyc1t1c2VySWRdO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHVzZXJzOiB1c2VycyB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnZ2V0TWVzc2FnZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2VJZCkge1xuICAgICAgICAgICAgdmFyIG5hbWVTcGFjZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZVNwYWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZVNwYWNlID0gJ2NvcmUubWFpbGVyJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5hbWVTcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBuYW1lU3BhY2UgKz0gXCIuXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBweWRpby5NZXNzYWdlSGFzaFtuYW1lU3BhY2UgKyBtZXNzYWdlSWRdO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bvc3RFbWFpbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwb3N0RW1haWwoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIHJlcG9zdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSBfc3RhdGUudXNlcnM7XG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IF9zdGF0ZS5zdWJqZWN0O1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBfc3RhdGUubWVzc2FnZTtcblxuICAgICAgICAgICAgaWYgKCFyZXBvc3QgJiYgdGhpcy5yZWZzLmNvbXBsZXRlciAmJiB0aGlzLnJlZnMuY29tcGxldGVyLmdldFBlbmRpbmdTZWFyY2hUZXh0ICYmIHRoaXMucmVmcy5jb21wbGV0ZXIuZ2V0UGVuZGluZ1NlYXJjaFRleHQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcy5jb21wbGV0ZXIub25Db21wbGV0ZXJSZXF1ZXN0KHRoaXMucmVmcy5jb21wbGV0ZXIuZ2V0UGVuZGluZ1NlYXJjaFRleHQoKSwgLTEpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMyLnBvc3RFbWFpbCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghT2JqZWN0LmtleXModXNlcnMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvck1lc3NhZ2U6IHRoaXMuZ2V0TWVzc2FnZSgyKSB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX3Byb3BzMiA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICB2YXIgbGluayA9IF9wcm9wczIubGluaztcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZUlkID0gX3Byb3BzMi50ZW1wbGF0ZUlkO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRGF0YSA9IF9wcm9wczIudGVtcGxhdGVEYXRhO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiBjYWxsYmFjayhyZXMsIGVycikge1xuICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHBvc3Rpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdTVUNDRVNTJywgX3RoaXMyLnByb3BzLnB5ZGlvLk1lc3NhZ2VIYXNoW1wiY29yZS5tYWlsZXIuMVwiXS5yZXBsYWNlKCclcycsIE9iamVjdC5rZXlzKHVzZXJzKS5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzMi5wcm9wcy5vbkRpc21pc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5wcm9wcy5vbkRpc21pc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzMi5zZXRTdGF0ZSh7IHVzZXJzOiB7fSwgc3ViamVjdDogJycsIG1lc3NhZ2U6ICcnIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMyLnByb3BzLnB5ZGlvLlVJLmRpc3BsYXlNZXNzYWdlKCdFUlJPUicsIF90aGlzMi5wcm9wcy5weWRpby5NZXNzYWdlSGFzaFtcImNvcmUubWFpbGVyLnNlbmRlci5lcnJvclwiXSArIChlcnIgPyAnIDogJyArIGVyci5tZXNzYWdlIDogJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBvc3Rpbmc6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnByb2Nlc3NQb3N0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5wcm9jZXNzUG9zdChFbWFpbCwgdXNlcnMsIHN1YmplY3QsIG1lc3NhZ2UsIGxpbmssIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlbWFpbCA9IG5ldyBFbWFpbChzdWJqZWN0LCBtZXNzYWdlLCBsaW5rIHx8IG51bGwpO1xuICAgICAgICAgICAgT2JqZWN0LmtleXModXNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBlbWFpbC5hZGRUYXJnZXQoayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZUlkKSB7XG4gICAgICAgICAgICAgICAgZW1haWwuc2V0VGVtcGxhdGVEYXRhKHRlbXBsYXRlSWQsIHRlbXBsYXRlRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbWFpbC5wb3N0KGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgX3N0YXRlMiA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICB2YXIgdXNlcnMgPSBfc3RhdGUyLnVzZXJzO1xuICAgICAgICAgICAgdmFyIHBvc3RpbmcgPSBfc3RhdGUyLnBvc3Rpbmc7XG4gICAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gX3N0YXRlMi5lcnJvck1lc3NhZ2U7XG4gICAgICAgICAgICB2YXIgc3ViamVjdCA9IF9zdGF0ZTIuc3ViamVjdDtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gX3N0YXRlMi5tZXNzYWdlO1xuXG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gW3RoaXMucHJvcHMuY2xhc3NOYW1lLCBcInJlYWN0LW1haWxlclwiLCBcInJlc2V0LXB5ZGlvLWZvcm1zXCJdLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgdmFyIHVzZXJzQ2hpcHMgPSBPYmplY3Qua2V5cyh1c2VycykubWFwKChmdW5jdGlvbiAodUlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoVXNlckNoaXAsIHsga2V5OiB1SWQsIHVzZXI6IHVzZXJzW3VJZF0sIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpczMucmVtb3ZlVXNlcih1SWQpO1xuICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB2YXIgZXJyb3JEaXYgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JEaXYgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZzogJzEwcHggMjBweCcsIGNvbG9yOiAncmVkJyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBfZXh0ZW5kcyh7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiB0aGlzLnByb3BzLnVuaXF1ZVVzZXJTdHlsZSA/IDAgOiA4XG4gICAgICAgICAgICB9LCB0aGlzLnByb3BzLnN0eWxlKTtcbiAgICAgICAgICAgIHZhciBjb250ZW50ID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuUGFwZXIsXG4gICAgICAgICAgICAgICAgeyB6RGVwdGg6IHRoaXMucHJvcHMuekRlcHRoICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLnpEZXB0aCA6IDIsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBzdHlsZTogc3R5bGUgfSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2gzJyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogX2V4dGVuZHMoeyBwYWRkaW5nOiAyMCwgY29sb3I6ICdyZ2JhKDAsMCwwLDAuODcpJywgZm9udFNpemU6IDI1LCBtYXJnaW5Cb3R0b206IDAsIHBhZGRpbmdCb3R0b206IDEwIH0sIHRoaXMucHJvcHMudGl0bGVTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5wYW5lbFRpdGxlXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBlcnJvckRpdixcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmFkZGl0aW9uYWxQYW5lVG9wLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnVuaXF1ZVVzZXJTdHlsZSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgIHsgY2xhc3NOYW1lOiAndXNlcnMtYmxvY2snLCBzdHlsZTogX2V4dGVuZHMoeyBwYWRkaW5nOiAnMCAyMHB4JyB9LCB0aGlzLnByb3BzLnVzZXJzQmxvY2tTdHlsZSkgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoUHlkaW9Db21wb25lbnRzLlVzZXJzQ29tcGxldGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdjb21wbGV0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRMYWJlbDogdGhpcy5nZXRNZXNzYWdlKCc4JyksXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2Vyc09ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ09ubHk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcmVlVmFsdWVBbGxvd2VkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25WYWx1ZVNlbGVjdGVkOiB0aGlzLmFkZFVzZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGVzOiBPYmplY3Qua2V5cyh1c2VycyksXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJTdWdnZXN0aW9uOiBmdW5jdGlvbiAodXNlck9iamVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChEZXN0QmFkZ2UsIHsgdXNlcjogdXNlck9iamVjdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpbzogcHlkaW8sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93QWRkcmVzc0Jvb2s6IHRoaXMucHJvcHMuc2hvd0FkZHJlc3NCb29rLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lSGlkZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHN0eWxlcy53cmFwcGVyIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2Vyc0NoaXBzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnVuaXF1ZVVzZXJTdHlsZSAmJiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKSxcbiAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy50ZW1wbGF0ZUlkICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nOiAnMCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwgeyBmdWxsV2lkdGg6IHRydWUsIHVuZGVybGluZVNob3c6IGZhbHNlLCBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5nZXRNZXNzYWdlKCc2JyksIHZhbHVlOiBzdWJqZWN0LCBvbkNoYW5nZTogdGhpcy51cGRhdGVTdWJqZWN0LmJpbmQodGhpcykgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICF0aGlzLnByb3BzLnRlbXBsYXRlSWQgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBfZXh0ZW5kcyh7IHBhZGRpbmc6ICcwIDIwcHgnIH0sIHRoaXMucHJvcHMubWVzc2FnZUJsb2NrU3R5bGUpIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLlRleHRGaWVsZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZXJsaW5lU2hvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG9hdGluZ0xhYmVsVGV4dDogdGhpcy5nZXRNZXNzYWdlKCc3JyksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpTGluZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnVwZGF0ZU1lc3NhZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NNYXg6IDZcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuYWRkaXRpb25hbFBhbmVCb3R0b20sXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbCksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHRleHRBbGlnbjogJ3JpZ2h0JywgcGFkZGluZzogJzhweCAyMHB4JyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25EaXNtaXNzICYmIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgbGFiZWw6IHRoaXMuZ2V0TWVzc2FnZSgnNTQnLCAnJyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25EaXNtaXNzIH0pLFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy5vbkRpc21pc3MgJiYgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRmxhdEJ1dHRvbiwgeyBsYWJlbDogdGhpcy5nZXRNZXNzYWdlKCcyMTYnLCAnJyksIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpczQuc2V0U3RhdGUoeyB1c2Vyczoge30sIHN1YmplY3Q6ICcnLCBtZXNzYWdlOiAnJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkZsYXRCdXR0b24sIHsgZGlzYWJsZWQ6IHBvc3RpbmcsIHByaW1hcnk6IHRydWUsIGxhYmVsOiB0aGlzLmdldE1lc3NhZ2UoJzc3JywgJycpLCBvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczQucG9zdEVtYWlsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm92ZXJsYXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiBzdHlsZXMub3ZlcmxheSB9LFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUGFuZTtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5QYW5lLlByb3BUeXBlcyA9IHtcbiAgICBtZXNzYWdlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICBzdWJqZWN0OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICB0ZW1wbGF0ZUlkOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICB0ZW1wbGF0ZURhdGE6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ub2JqZWN0LFxuICAgIGxpbms6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uc3RyaW5nLFxuICAgIG9uRGlzbWlzczogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jLFxuICAgIGNsYXNzTmFtZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5zdHJpbmcsXG4gICAgb3ZlcmxheTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5ib29sLFxuICAgIHVuaXF1ZVVzZXJTdHlsZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5ib29sLFxuICAgIHVzZXJzOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLm9iamVjdCxcbiAgICBwYW5lbFRpdGxlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLnN0cmluZyxcbiAgICB6RGVwdGg6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10ubnVtYmVyLFxuICAgIHNob3dBZGRyZXNzQm9vazogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5ib29sLFxuICAgIHByb2Nlc3NQb3N0OiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmZ1bmMsXG4gICAgYWRkaXRpb25hbFBhbmVUb3A6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihfcmVhY3QyWydkZWZhdWx0J10uQ29tcG9uZW50KSxcbiAgICBhZGRpdGlvbmFsUGFuZUJvdHRvbTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5pbnN0YW5jZU9mKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpXG59O1xuXG52YXIgUHJlZmVyZW5jZXNQYW5lbCA9IChmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudDQpIHtcbiAgICBfaW5oZXJpdHMoUHJlZmVyZW5jZXNQYW5lbCwgX1JlYWN0JENvbXBvbmVudDQpO1xuXG4gICAgZnVuY3Rpb24gUHJlZmVyZW5jZXNQYW5lbCgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFByZWZlcmVuY2VzUGFuZWwpO1xuXG4gICAgICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFByZWZlcmVuY2VzUGFuZWwucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoUHJlZmVyZW5jZXNQYW5lbCwgW3tcbiAgICAgICAga2V5OiAncmVuZGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICdQcmVmZXJlbmNlcyBQYW5lbCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gUHJlZmVyZW5jZXNQYW5lbDtcbn0pKF9yZWFjdDJbJ2RlZmF1bHQnXS5Db21wb25lbnQpO1xuXG5leHBvcnRzLlBhbmUgPSBQYW5lO1xuZXhwb3J0cy5QcmVmZXJlbmNlc1BhbmVsID0gUHJlZmVyZW5jZXNQYW5lbDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NvbXBvbmVudHMgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzXCIpO1xuXG5leHBvcnRzLlBhbmUgPSBfY29tcG9uZW50cy5QYW5lO1xuZXhwb3J0cy5QcmVmZXJlbmNlc1BhbmVsID0gX2NvbXBvbmVudHMuUHJlZmVyZW5jZXNQYW5lbDtcbiJdfQ==
