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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

exports['default'] = _react2['default'].createClass({
    displayName: 'UserRolesPicker',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        availableRoles: _react2['default'].PropTypes.array,
        rolesDetails: _react2['default'].PropTypes.object,
        currentRoles: _react2['default'].PropTypes.array,
        currentRolesDetails: _react2['default'].PropTypes.array,
        controller: _react2['default'].PropTypes.object
    },

    onChange: function onChange(e, selectedIndex, value) {
        if (value === -1) {
            return;
        }
        var newRoles = this.props.currentRoles.slice();
        newRoles.push(value);
        this.props.controller.updateUserRoles(newRoles);
    },

    remove: function remove(roleId) {
        var newRoles = _pydioUtilLang2['default'].arrayWithout(this.props.currentRoles, this.props.currentRoles.indexOf(roleId));
        this.props.controller.updateUserRoles(newRoles);
    },

    orderUpdated: function orderUpdated(oldId, newId, currentValues) {
        var ordered = currentValues.map(function (o) {
            return o.payload;
        });
        this.props.controller.orderUserRoles(ordered);
    },

    render: function render() {

        var groups = [],
            manual = [],
            users = [];
        var ctx = this.context;
        var _props = this.props;
        var currentRoles = _props.currentRoles;
        var rolesDetails = _props.rolesDetails;
        var currentRolesDetails = _props.currentRolesDetails;
        var availableRoles = _props.availableRoles;
        var loadingMessage = _props.loadingMessage;

        currentRoles.map((function (r) {
            var crtDetail = currentRolesDetails[r] || { label: r };
            if (crtDetail.groupRole) {
                if (r === 'ROOT_GROUP') {
                    groups.push('/ ' + ctx.getMessage('user.25', 'ajxp_admin'));
                } else {
                    groups.push(ctx.getMessage('user.26', 'ajxp_admin').replace('%s', crtDetail.label || r));
                }
            } else if (crtDetail.userRole) {
                users.push(ctx.getMessage('user.27', 'ajxp_admin'));
            } else {
                if (!rolesDetails[r]) {
                    return;
                }
                var label = rolesDetails[r].label;
                if (rolesDetails[r].sticky) {
                    label += ' [' + ctx.getMessage('19') + ']';
                } // always overrides
                manual.push({ payload: r, text: label });
            }
        }).bind(this));

        var addableRoles = [_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: ctx.getMessage('20') })];
        availableRoles.map(function (r) {
            if (currentRoles.indexOf(r) === -1) {
                addableRoles.push(_react2['default'].createElement(_materialUi.MenuItem, { value: r, primaryText: rolesDetails[r].label || r }));
            }
        });

        var fixedRoleStyle = {
            padding: 10,
            fontSize: 14,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            margin: '8px 0'
        };

        return _react2['default'].createElement(
            'div',
            { className: 'user-roles-picker', style: { padding: 0 } },
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
