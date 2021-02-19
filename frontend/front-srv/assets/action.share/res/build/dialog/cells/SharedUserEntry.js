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

var _materialUi = require('material-ui');

var _UserBadge = require('./UserBadge');

var _UserBadge2 = _interopRequireDefault(_UserBadge);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var PropTypes = require('prop-types');
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
var React = require('react');

var SharedUserEntry = (function (_React$Component) {
    _inherits(SharedUserEntry, _React$Component);

    function SharedUserEntry() {
        var _this = this;

        _classCallCheck(this, SharedUserEntry);

        _get(Object.getPrototypeOf(SharedUserEntry.prototype), 'constructor', this).apply(this, arguments);

        this.onRemove = function () {
            _this.props.onUserObjectRemove(_this.props.cellAcl.RoleId);
        };

        this.onInvite = function () {
            var targets = {};
            var userObject = PydioUsers.User.fromIdmUser(_this.props.cellAcl.User);
            targets[userObject.getId()] = userObject;
            _this.props.sendInvitations(targets);
        };

        this.onUpdateRight = function (name, checked) {
            _this.props.onUserObjectUpdateRight(_this.props.cellAcl.RoleId, name, checked);
        };
    }

    _createClass(SharedUserEntry, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var cellAcl = _props.cellAcl;
            var pydio = _props.pydio;

            var menuItems = [];
            var type = cellAcl.User ? 'user' : cellAcl.Group ? 'group' : 'team';

            // Do not render current user
            if (cellAcl.User && cellAcl.User.Login === pydio.user.id) {
                return null;
            }

            if (type !== 'group') {
                if (this.props.sendInvitations) {
                    // Send invitation
                    menuItems.push({
                        text: this.props.getMessage('45'),
                        callback: this.onInvite
                    });
                }
            }
            if (!this.props.isReadonly() && !this.props.readonly) {
                // Remove Entry
                menuItems.push({
                    text: this.props.getMessage('257', ''),
                    callback: this.onRemove
                });
            }

            var label = undefined,
                avatar = undefined;
            switch (type) {
                case "user":
                    label = cellAcl.User.Attributes["displayName"] || cellAcl.User.Login;
                    avatar = cellAcl.User.Attributes["avatar"];
                    break;
                case "group":
                    if (cellAcl.Group.Attributes) {
                        label = cellAcl.Group.Attributes["displayName"] || cellAcl.Group.GroupLabel;
                    } else {
                        label = cellAcl.Group.Uuid;
                    }
                    break;
                case "team":
                    if (cellAcl.Role) {
                        label = cellAcl.Role.Label;
                    } else {
                        label = "No role found";
                    }
                    break;
                default:
                    label = cellAcl.RoleId;
                    break;
            }
            var read = false,
                write = false;
            cellAcl.Actions.map(function (action) {
                if (action.Name === 'read') {
                    read = true;
                }
                if (action.Name === 'write') {
                    write = true;
                }
            });
            var disabled = this.props.isReadonly() || this.props.readonly;
            var style = {
                display: 'flex',
                width: 70
            };
            if (!menuItems.length) {
                style = _extends({}, style, { marginRight: 48 });
            }

            return React.createElement(
                _UserBadge2['default'],
                {
                    label: label,
                    avatar: avatar,
                    type: type,
                    menus: menuItems
                },
                React.createElement(
                    'span',
                    { style: style },
                    React.createElement(_materialUi.Checkbox, { disabled: disabled, checked: read, onCheck: function (e, v) {
                            _this2.onUpdateRight('read', v);
                        } }),
                    React.createElement(_materialUi.Checkbox, { disabled: disabled, checked: write, onCheck: function (e, v) {
                            _this2.onUpdateRight('write', v);
                        } })
                )
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            cellAcl: PropTypes.object.isRequired,
            sendInvitations: PropTypes.func,
            onUserObjectRemove: PropTypes.func.isRequired,
            onUserObjectUpdateRight: PropTypes.func.isRequired
        },
        enumerable: true
    }]);

    return SharedUserEntry;
})(React.Component);

exports['default'] = SharedUserEntry = (0, _ShareContextConsumer2['default'])(SharedUserEntry);
exports['default'] = SharedUserEntry;
module.exports = exports['default'];
