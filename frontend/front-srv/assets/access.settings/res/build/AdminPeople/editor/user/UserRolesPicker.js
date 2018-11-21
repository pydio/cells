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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

exports['default'] = _react2['default'].createClass({
    displayName: 'UserRolesPicker',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        roles: _react2['default'].PropTypes.array,
        addRole: _react2['default'].PropTypes.func,
        removeRole: _react2['default'].PropTypes.func,
        switchRoles: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            availableRoles: []
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles().then(function (roles) {
            _this.setState({ availableRoles: roles });
        });
    },

    onChange: function onChange(e, selectedIndex, value) {
        if (value === -1) {
            return;
        }
        this.props.addRole(value);
    },

    remove: function remove(value) {
        var availableRoles = this.state.availableRoles;

        var role = availableRoles.filter(function (r) {
            return r.Uuid === value;
        })[0];
        this.props.removeRole(role);
    },

    orderUpdated: function orderUpdated(oldId, newId, currentValues) {
        this.props.switchRoles(oldId, newId);
    },

    render: function render() {

        var groups = [],
            manual = [],
            users = [];
        var ctx = this.context;
        var _props = this.props;
        var roles = _props.roles;
        var loadingMessage = _props.loadingMessage;
        var availableRoles = this.state.availableRoles;

        roles.map((function (r) {
            if (r.GroupRole) {
                if (r.Uuid === 'ROOT_GROUP') {
                    groups.push('/ ' + ctx.getMessage('user.25', 'ajxp_admin'));
                } else {
                    groups.push(ctx.getMessage('user.26', 'ajxp_admin').replace('%s', r.Label || r.Uuid));
                }
            } else if (r.UserRole) {
                users.push(ctx.getMessage('user.27', 'ajxp_admin'));
            } else {
                /*
                if(rolesDetails[r].sticky) {
                    label += ' [' + ctx.getMessage('19') + ']';
                } // always overrides
                */
                manual.push({ payload: r.Uuid, text: r.Label });
            }
        }).bind(this));

        var addableRoles = [_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: ctx.getMessage('20') })].concat(_toConsumableArray(availableRoles.filter(function (r) {
            return roles.indexOf(r) === -1;
        }).map(function (r) {
            return _react2['default'].createElement(_materialUi.MenuItem, { value: r, primaryText: r.Label || r.Uuid });
        })));

        var fixedRoleStyle = {
            padding: 10,
            fontSize: 14,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            margin: '8px 0'
        };

        return _react2['default'].createElement(
            'div',
            { className: 'user-roles-picker', style: { padding: 0, marginBottom: 20 } },
            _react2['default'].createElement(
                'div',
                { style: { paddingLeft: 22, marginTop: -40, display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, color: '#bdbdbd', fontWeight: 500 } },
                    'Manage roles ',
                    loadingMessage ? ' (' + ctx.getMessage('21') + ')' : ''
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'roles-picker-menu', style: { marginTop: -12 } },
                    _react2['default'].createElement(
                        _materialUi.DropDownMenu,
                        { onChange: this.onChange, value: -1 },
                        addableRoles
                    )
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'roles-list', style: { margin: '0 16px' } },
                groups.map(function (g) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "group-" + g, style: fixedRoleStyle },
                        g
                    );
                }),
                _react2['default'].createElement(PydioComponents.SortableList, {
                    key: 'sortable',
                    values: manual,
                    removable: true,
                    onRemove: this.remove,
                    onOrderUpdated: this.orderUpdated,
                    itemClassName: 'role-item role-item-sortable'
                }),
                users.map(function (u) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "user-" + u, style: fixedRoleStyle },
                        u
                    );
                })
            )
        );
    }

});
module.exports = exports['default'];
