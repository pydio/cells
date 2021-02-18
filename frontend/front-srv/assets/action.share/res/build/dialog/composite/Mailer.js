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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _materialUi = require('material-ui');

var _cellsSdk = require('cells-sdk');

var Mailer = (function (_React$Component) {
    _inherits(Mailer, _React$Component);

    function Mailer(props) {
        _classCallCheck(this, Mailer);

        _get(Object.getPrototypeOf(Mailer.prototype), 'constructor', this).call(this, props);
        this.state = { mailerData: null };
    }

    _createClass(Mailer, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var _this = this;

            var subject = newProps.subject;
            var message = newProps.message;
            var users = newProps.users;
            var linkModel = newProps.linkModel;
            var templateId = newProps.templateId;
            var templateData = newProps.templateData;

            if (subject || templateId) {
                if (_mainShareHelper2['default'].forceMailerOldSchool()) {
                    var encSubject = encodeURIComponent(subject);
                    location.href = "mailto:custom-email@domain.com?Subject=" + encSubject + "&Body=" + message;
                    return;
                }
                //const linkData = hash ? this.state.model.getLinkData(hash) : undefined;
                _pydioHttpResourcesManager2['default'].loadClassesAndApply(['PydioMailer'], function () {
                    _this.setState({
                        mailerData: _extends({}, newProps, {
                            enableIdentification: linkModel && linkModel.getLink().TargetUsers,
                            identifiedOnly: linkModel && linkModel.getLink().RestrictToTargetUsers,
                            crippleIdentificationKeys: true
                        })
                    });
                });
            } else {
                this.setState({ mailerData: null });
            }
        }
    }, {
        key: 'toggleMailerData',
        value: function toggleMailerData(data) {
            this.setState({ mailerData: _extends({}, this.state.mailerData, data) });
        }
    }, {
        key: 'dismissMailer',
        value: function dismissMailer() {
            this.props.onDismiss();
        }
    }, {
        key: 'mailerProcessPost',
        value: function mailerProcessPost(Email, users, subject, message, link, callback) {
            var mailerData = this.state.mailerData;
            var crippleIdentificationKeys = mailerData.crippleIdentificationKeys;
            var identifiedOnly = mailerData.identifiedOnly;
            var linkModel = mailerData.linkModel;

            var linkObject = linkModel.getLink();
            if (!linkObject.TargetUsers) {
                linkObject.TargetUsers = {};
            }
            linkObject.RestrictToTargetUsers = identifiedOnly;

            var shareMails = {};
            Object.keys(users).forEach(function (u) {
                var k = crippleIdentificationKeys ? Math.random().toString(36).substring(7) : u;
                linkObject.TargetUsers[k] = _cellsSdk.RestShareLinkTargetUser.constructFromObject({ Display: users[u].getLabel(), DownloadCount: 0 });
                shareMails[k] = u;
            });
            linkModel.updateLink(linkObject);
            linkModel.save().then(function () {
                var email = new Email();
                var originalLink = linkModel.getPublicUrl();
                var regexp = new RegExp(originalLink, 'g');
                Object.keys(shareMails).forEach(function (u) {
                    var newLink = originalLink + '?u=' + u;
                    var newMessage = message.replace(regexp, newLink);
                    email.addTarget(shareMails[u], subject, newMessage);
                });
                email.post(function (res) {
                    callback(res);
                });
            });
        }
    }, {
        key: 'getMessage',
        value: function getMessage(key) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

            return this.props.pydio.MessageHash[namespace + (namespace ? '.' : '') + key];
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            if (this.state.mailerData) {
                var mailerData = this.state.mailerData;

                var customizeMessagePane = undefined;
                if (false && mailerData.linkModel) {
                    var style = mailerData.enableIdentification ? { padding: '10px 20px', backgroundColor: '#ECEFF1', fontSize: 14 } : { padding: '10px 20px 0', fontSize: 14 };
                    var letUserChooseCripple = this.props.pydio.getPluginConfigs('action.share').get('EMAIL_PERSONAL_LINK_SEND_CLEAR');
                    customizeMessagePane = _react2['default'].createElement(
                        'div',
                        { style: style },
                        _react2['default'].createElement(_materialUi.Toggle, { label: this.getMessage(235), toggled: mailerData.enableIdentification, onToggle: function (e, c) {
                                _this2.toggleMailerData({ enableIdentification: c });
                            } }),
                        mailerData.enableIdentification && _react2['default'].createElement(_materialUi.Toggle, { label: "-- " + this.getMessage(236), toggled: mailerData.identifiedOnly, onToggle: function (e, c) {
                                _this2.toggleMailerData({ identifiedOnly: c });
                            } }),
                        mailerData.enableIdentification && letUserChooseCripple && _react2['default'].createElement(_materialUi.Toggle, { label: "-- " + this.getMessage(237), toggled: mailerData.crippleIdentificationKeys, onToggle: function (e, c) {
                                _this2.toggleMailerData({ crippleIdentificationKeys: c });
                            } })
                    );
                }
                return _react2['default'].createElement(PydioMailer.Pane, _extends({}, mailerData, {
                    onDismiss: this.dismissMailer.bind(this),
                    overlay: true,
                    className: 'share-center-mailer',
                    panelTitle: this.props.pydio.MessageHash["share_center.45"],
                    additionalPaneTop: customizeMessagePane,
                    processPost: mailerData.enableIdentification ? this.mailerProcessPost.bind(this) : null,
                    style: { width: 420, margin: '0 auto' }
                }));
            } else {
                return null;
            }
        }
    }]);

    return Mailer;
})(_react2['default'].Component);

exports['default'] = Mailer;
module.exports = exports['default'];
