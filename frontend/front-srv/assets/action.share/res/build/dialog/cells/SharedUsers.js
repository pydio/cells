'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _SharedUserEntry = require('./SharedUserEntry');

var _SharedUserEntry2 = _interopRequireDefault(_SharedUserEntry);

var _mainActionButton = require('../main/ActionButton');

var _mainActionButton2 = _interopRequireDefault(_mainActionButton);

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

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UsersCompleter = _Pydio$requireLib.UsersCompleter;

var SharedUsers = (function (_React$Component) {
    _inherits(SharedUsers, _React$Component);

    function SharedUsers() {
        var _this = this;

        _classCallCheck(this, SharedUsers);

        _get(Object.getPrototypeOf(SharedUsers.prototype), 'constructor', this).apply(this, arguments);

        this.sendInvitationToAllUsers = function () {
            var _props = _this.props;
            var cellAcls = _props.cellAcls;
            var pydio = _props.pydio;

            var userObjects = [];
            Object.keys(cellAcls).map(function (k) {
                var acl = cellAcls[k];
                if (acl.User && acl.User.Login === pydio.user.id) {
                    return;
                }
                if (acl.User) {
                    var userObject = PydioUsers.User.fromIdmUser(acl.User);
                    userObjects[userObject.getId()] = userObject;
                }
            });
            _this.props.sendInvitations(userObjects);
        };

        this.clearAllUsers = function () {
            Object.keys(_this.props.cellAcls).map(function (k) {
                _this.props.onUserObjectRemove(k);
            });
        };

        this.valueSelected = function (userObject) {
            if (userObject.IdmUser) {
                _this.props.onUserObjectAdd(userObject.IdmUser);
            } else {
                _this.props.onUserObjectAdd(userObject.IdmRole);
            }
        };
    }

    _createClass(SharedUsers, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props;
            var cellAcls = _props2.cellAcls;
            var pydio = _props2.pydio;

            var authConfigs = pydio.getPluginConfigs('core.auth');
            var index = 0;
            var userEntries = [];
            Object.keys(cellAcls).map(function (k) {
                var acl = cellAcls[k];
                if (acl.User && acl.User.Login === pydio.user.id) {
                    return;
                }
                index++;
                userEntries.push(_react2['default'].createElement(_SharedUserEntry2['default'], {
                    cellAcl: acl,
                    key: index,
                    pydio: _this2.props.pydio,
                    readonly: _this2.props.readonly,
                    sendInvitations: _this2.props.sendInvitations,
                    onUserObjectRemove: _this2.props.onUserObjectRemove,
                    onUserObjectUpdateRight: _this2.props.onUserObjectUpdateRight
                }));
            });

            var actionLinks = [];
            var aclsLength = Object.keys(this.props.cellAcls).length;
            if (aclsLength && !this.props.isReadonly() && !this.props.readonly) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'clear', callback: this.clearAllUsers, tooltipPosition: "top-center", mdiIcon: 'delete', messageId: '180' }));
            }
            if (aclsLength && this.props.sendInvitations) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'invite', callback: this.sendInvitationToAllUsers, tooltipPosition: "top-center", mdiIcon: 'email-outline', messageId: '45' }));
            }
            if (this.props.saveSelectionAsTeam && aclsLength > 1 && !this.props.isReadonly() && !this.props.readonly) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'team', callback: this.props.saveSelectionAsTeam, mdiIcon: 'account-multiple-plus', tooltipPosition: "top-center", messageId: '509', messageCoreNamespace: true }));
            }
            var rwHeader = undefined,
                usersInput = undefined;
            if (userEntries.length) {
                rwHeader = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', marginBottom: -8, marginTop: -8, color: 'rgba(0,0,0,.33)', fontSize: 12 } },
                    _react2['default'].createElement('div', { style: { flex: 1 } }),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 43, textAlign: 'center' } },
                        _react2['default'].createElement(
                            'span',
                            { style: { borderBottom: '2px solid rgba(0,0,0,0.13)' } },
                            this.props.getMessage('361', '')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 43, textAlign: 'center' } },
                        _react2['default'].createElement(
                            'span',
                            { style: { borderBottom: '2px solid rgba(0,0,0,0.13)' } },
                            this.props.getMessage('181')
                        )
                    ),
                    _react2['default'].createElement('div', { style: { width: 52 } })
                );
            }
            if (!this.props.isReadonly() && !this.props.readonly) {
                var excludes = Object.values(cellAcls).map(function (a) {
                    if (a.User) {
                        return a.User.Login;
                    } else if (a.Group) {
                        return a.Group.Uuid;
                    } else if (a.Role) {
                        return a.Role.Uuid;
                    } else {
                        return null;
                    }
                }).filter(function (k) {
                    return !!k;
                });
                usersInput = _react2['default'].createElement(UsersCompleter, {
                    className: 'share-form-users',
                    fieldLabel: this.props.getMessage('34'),
                    onValueSelected: this.valueSelected,
                    pydio: this.props.pydio,
                    showAddressBook: true,
                    usersFrom: 'local',
                    excludes: excludes,
                    existingOnly: !authConfigs.get('USER_CREATE_USERS')
                });
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: userEntries.length ? { margin: '-20px 8px 16px' } : { marginTop: -20 } },
                    usersInput
                ),
                rwHeader,
                _react2['default'].createElement(
                    'div',
                    null,
                    userEntries
                ),
                !userEntries.length && _react2['default'].createElement(
                    'div',
                    { style: { color: 'rgba(0,0,0,0.43)' } },
                    this.props.getMessage('182')
                ),
                userEntries.length > 0 && _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center' } },
                    actionLinks
                )
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),

            cellAcls: _propTypes2['default'].object,

            saveSelectionAsTeam: _propTypes2['default'].func,
            sendInvitations: _propTypes2['default'].func,
            showTitle: _propTypes2['default'].bool,

            onUserObjectAdd: _propTypes2['default'].func.isRequired,
            onUserObjectRemove: _propTypes2['default'].func.isRequired,
            onUserObjectUpdateRight: _propTypes2['default'].func.isRequired

        },
        enumerable: true
    }]);

    return SharedUsers;
})(_react2['default'].Component);

exports['default'] = SharedUsers = (0, _ShareContextConsumer2['default'])(SharedUsers);
exports['default'] = SharedUsers;
module.exports = exports['default'];
