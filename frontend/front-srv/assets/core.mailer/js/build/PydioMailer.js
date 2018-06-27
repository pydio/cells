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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global) {

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

    var DestBadge = React.createClass({
        displayName: 'DestBadge',

        propTypes: {
            user: React.PropTypes.instanceOf(PydioUsers.User)
        },
        render: function render() {
            var userObject = this.props.user;
            return React.createElement(
                'div',
                { className: "share-dialog user-badge user-type-" + (userObject.getTemporary() ? "tmp_user" : "user") },
                React.createElement('span', { className: "avatar icon-" + (userObject.getTemporary() ? "envelope" : "user") }),
                React.createElement(
                    'span',
                    { className: 'user-badge-label' },
                    userObject.getExtendedLabel() || userObject.getLabel()
                )
            );
        }
    });

    var UserEntry = React.createClass({
        displayName: 'UserEntry',

        propTypes: {
            user: React.PropTypes.instanceOf(PydioUsers.User),
            onRemove: React.PropTypes.func
        },
        remove: function remove() {
            this.props.onRemove(this.props.user.getId());
        },
        toggleRemove: function toggleRemove() {
            var current = this.state && this.state.remove;
            this.setState({ remove: !current });
        },
        render: function render() {
            var icon,
                className = 'pydio-mailer-user ' + 'user-type-' + (this.props.user.getTemporary() ? "email" : "user");
            var clik = function clik() {};
            if (this.state && this.state.remove) {
                clik = this.remove;
                icon = React.createElement('span', { className: 'avatar mdi mdi-close' });
                className += ' remove';
            } else {
                icon = React.createElement('span', { className: "avatar icon-" + (this.props.user.getTemporary() ? "envelope" : "user") });
            }
            return React.createElement(
                'div',
                { className: className, onMouseOver: this.toggleRemove, onMouseOut: this.toggleRemove, onClick: clik },
                icon,
                this.props.user.getLabel()
            );
        }
    });

    var UserChip = React.createClass({
        displayName: 'UserChip',

        propTypes: {
            user: React.PropTypes.instanceOf(PydioUsers.User),
            onRemove: React.PropTypes.func
        },
        remove: function remove() {
            this.props.onRemove(this.props.user.getId());
        },
        render: function render() {
            var tmp = this.props.user.getTemporary();
            var icon = React.createElement(MaterialUI.FontIcon, { className: "icon-" + (tmp ? "envelope" : "user") });
            var colors = MaterialUI.Style.colors;

            return React.createElement(
                MaterialUI.Chip,
                {
                    backgroundColor: tmp ? colors.lightBlue100 : colors.blueGrey100,
                    onRequestDelete: this.remove,
                    style: styles.chip
                },
                React.createElement(MaterialUI.Avatar, { icon: icon, color: tmp ? 'white' : colors.blueGrey600, backgroundColor: tmp ? colors.lightBlue300 : colors.blueGrey300 }),
                this.props.user.getLabel()
            );
        }
    });

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
            if (subject) this._subjects.push(subject);
            if (message) this._messages.push(message);
            if (link) this._links.push(link);
        }

        _createClass(Email, [{
            key: 'addTarget',
            value: function addTarget(userOrEmail) {
                var subject = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                var message = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
                var link = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

                this._targets.push(userOrEmail);
                if (subject) this._subjects.push(subject);
                if (message) this._messages.push(message);
                if (link) this._links.push(link);
            }
        }, {
            key: 'setTemplateData',
            value: function setTemplateData(templateId, templateData) {
                this.templateId = templateId;
                this.templateData = templateData;
            }
        }, {
            key: 'post',
            value: function post() {
                var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

                if (!this._subjects.length && !this.templateId || !this._targets.length || !this._messages.length) {
                    throw new Error('Invalid data');
                }
                var params = {
                    get_action: "send_mail",
                    'emails[]': this._targets
                };
                if (this._messages.length === 1) {
                    params['message'] = this._messages[0];
                } else {
                    params['messages[]'] = this._messages;
                }

                if (this._subjects.length === 1) {
                    params['subject'] = this._subjects[0];
                } else {
                    params['subjects[]'] = this._subjects;
                }

                if (this._links.length === 1) {
                    params['link'] = this._links;
                } else if (this._links.length > 1) {
                    params['links[]'] = this._links;
                }
                if (this.templateId) {
                    params["template_id"] = this.templateId;
                    params["template_data"] = JSON.stringify(this.templateData);
                }

                var client = PydioApi.getClient();
                client.request(params, (function (transport) {
                    var res = client.parseXmlMessage(transport.responseXML);
                    callback(res);
                }).bind(this));
            }
        }]);

        return Email;
    })();

    var Mailer = React.createClass({
        displayName: 'Mailer',

        propTypes: {
            message: React.PropTypes.string,
            subject: React.PropTypes.string,
            templateId: React.PropTypes.string,
            templateData: React.PropTypes.object,
            link: React.PropTypes.string,
            onDismiss: React.PropTypes.func,
            className: React.PropTypes.string,
            overlay: React.PropTypes.bool,
            uniqueUserStyle: React.PropTypes.bool,
            users: React.PropTypes.object,
            panelTitle: React.PropTypes.string,
            zDepth: React.PropTypes.number,
            showAddressBook: React.PropTypes.bool,
            processPost: React.PropTypes.func,
            additionalPaneTop: React.PropTypes.instanceOf(React.Component),
            additionalPaneBottom: React.PropTypes.instanceOf(React.Component)
        },

        getInitialState: function getInitialState() {
            return {
                users: this.props.users || {},
                subject: this.props.subject,
                message: this.props.message,
                errorMessage: null
            };
        },

        getDefaultProps: function getDefaultProps() {
            return { showAddressBook: true };
        },

        updateSubject: function updateSubject(event) {
            this.setState({ subject: event.currentTarget.value });
        },

        updateMessage: function updateMessage(event) {
            this.setState({ message: event.currentTarget.value });
        },

        addUser: function addUser(userObject) {
            var users = this.state.users;
            users[userObject.getId()] = userObject;
            this.setState({ users: users, errorMessage: null });
        },

        removeUser: function removeUser(userId) {
            delete this.state.users[userId];
            this.setState({ users: this.state.users });
        },

        getMessage: function getMessage(messageId) {
            var nameSpace = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

            try {
                if (nameSpace === undefined) nameSpace = 'core.mailer';
                if (nameSpace) nameSpace += ".";
                return global.pydio.MessageHash[nameSpace + messageId];
            } catch (e) {
                return messageId;
            }
        },

        postEmail: function postEmail() {
            var _this = this;

            var repost = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var _state = this.state;
            var users = _state.users;
            var subject = _state.subject;
            var message = _state.message;

            if (!repost && this.refs.completer && this.refs.completer.getPendingSearchText && this.refs.completer.getPendingSearchText()) {
                this.refs.completer.onCompleterRequest(this.refs.completer.getPendingSearchText(), -1);
                setTimeout(function () {
                    return _this.postEmail(true);
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
                if (res) _this.props.onDismiss();
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
        },

        usersLoaderRenderSuggestion: function usersLoaderRenderSuggestion(userObject) {
            return React.createElement(DestBadge, { user: userObject });
        },

        render: function render() {
            var _this2 = this;

            var className = [this.props.className, "react-mailer", "reset-pydio-forms"].join(" ");
            var users = Object.keys(this.state.users).map((function (uId) {
                return React.createElement(UserChip, { key: uId, user: this.state.users[uId], onRemove: this.removeUser });
            }).bind(this));
            var errorDiv = undefined;
            if (this.state.errorMessage) {
                errorDiv = React.createElement(
                    'div',
                    { style: { padding: '10px 20px', color: 'red' } },
                    this.state.errorMessage
                );
            }
            var style = _extends({
                margin: this.props.uniqueUserStyle ? 0 : 8
            }, this.props.style);
            var content = React.createElement(
                MaterialUI.Paper,
                { zDepth: this.props.zDepth !== undefined ? this.props.zDepth : 2, className: className, style: style },
                React.createElement(
                    'h3',
                    { style: { padding: 20, color: 'rgba(0,0,0,0.87)', fontSize: 25, marginBottom: 0, paddingBottom: 10 } },
                    this.props.panelTitle
                ),
                errorDiv,
                this.props.additionalPaneTop,
                !this.props.uniqueUserStyle && React.createElement(
                    'div',
                    { className: 'users-block', style: { padding: '0 20px' } },
                    React.createElement(PydioComponents.UsersCompleter, {
                        ref: 'completer',
                        fieldLabel: this.getMessage('8'),
                        usersOnly: true,
                        existingOnly: true,
                        freeValueAllowed: true,
                        onValueSelected: this.addUser,
                        excludes: Object.keys(this.state.users),
                        renderSuggestion: this.usersLoaderRenderSuggestion,
                        pydio: global.pydio,
                        showAddressBook: this.props.showAddressBook,
                        underlineHide: true
                    }),
                    React.createElement(
                        'div',
                        { style: styles.wrapper },
                        users
                    )
                ),
                !this.props.uniqueUserStyle && React.createElement(MaterialUI.Divider, null),
                !this.props.templateId && React.createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    React.createElement(MaterialUI.TextField, { fullWidth: true, underlineShow: false, floatingLabelText: this.getMessage('6'), value: this.state.subject, onChange: this.updateSubject })
                ),
                !this.props.templateId && React.createElement(MaterialUI.Divider, null),
                React.createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    React.createElement(MaterialUI.TextField, {
                        fullWidth: true,
                        underlineShow: false,
                        floatingLabelText: this.getMessage('7'),
                        value: this.state.message,
                        multiLine: true,
                        onChange: this.updateMessage,
                        rowsMax: 6
                    })
                ),
                this.props.additionalPaneBottom,
                React.createElement(MaterialUI.Divider, null),
                React.createElement(
                    'div',
                    { style: { textAlign: 'right', padding: '8px 20px' } },
                    React.createElement(MaterialUI.FlatButton, { label: this.getMessage('54', ''), onTouchTap: this.props.onDismiss }),
                    React.createElement(MaterialUI.FlatButton, { primary: true, label: this.getMessage('77', ''), onTouchTap: function (e) {
                            return _this2.postEmail();
                        } })
                )
            );
            if (this.props.overlay) {
                return React.createElement(
                    'div',
                    { style: styles.overlay },
                    content
                );
            } else {
                return content;
            }
        }
    });

    var Preferences = React.createClass({
        displayName: 'Preferences',

        render: function render() {
            return React.createElement(
                'div',
                null,
                'Preferences Panel'
            );
        }
    });

    var PydioMailer = global.PydioMailer || {};
    PydioMailer.Pane = Mailer;
    PydioMailer.PreferencesPanel = Preferences;
    global.PydioMailer = PydioMailer;
})(window);
