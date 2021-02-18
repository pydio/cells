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
