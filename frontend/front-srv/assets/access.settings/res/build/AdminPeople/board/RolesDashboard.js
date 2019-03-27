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

var _materialUi = require('material-ui');

var _editorEditor = require('../editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var RolesDashboard = _react2['default'].createClass({
    displayName: 'RolesDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            roles: [],
            loading: false,
            showTechnical: false
        };
    },

    load: function load() {
        var _this = this;

        var showTechnical = this.state.showTechnical;

        this.setState({ loading: true });
        _pydio2['default'].startLoading();
        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles(showTechnical, 0, 1000).then(function (roles) {
            _pydio2['default'].endLoading();
            _this.setState({ roles: roles, loading: false });
        })['catch'](function (e) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        this.load();
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor: function openRoleEditor(idmRole) {
        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props = this.props;
        var advancedAcl = _props.advancedAcl;
        var pydio = _props.pydio;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        var editorData = {
            COMPONENT: _editorEditor2['default'],
            PROPS: {
                ref: "editor",
                idmRole: idmRole,
                pydio: pydio,
                initialEditSection: initialSection,
                onRequestTabClose: this.closeRoleEditor,
                advancedAcl: advancedAcl
            }
        };
        this.props.openRightPane(editorData);
        return true;
    },

    closeRoleEditor: function closeRoleEditor() {
        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
        return true;
    },

    deleteAction: function deleteAction(roleId) {
        var _this2 = this;

        var pydio = this.props.pydio;

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: pydio.MessageHash['settings.126'],
            validCallback: function validCallback() {
                _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteRole(roleId).then(function () {
                    _this2.load();
                });
            }
        });
    },

    createRoleAction: function createRoleAction() {
        var _this3 = this;

        pydio.UI.openComponentInModal('AdminPeople', 'CreateRoleOrGroupForm', {
            type: 'role',
            roleNode: this.state.currentNode,
            openRoleEditor: this.openRoleEditor.bind(this),
            reload: function reload() {
                _this3.load();
            }
        });
    },

    computeTableData: function computeTableData(searchRoleString) {
        var roles = this.state.roles;

        var data = [];
        roles.map(function (role) {
            var label = role.Label;
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            data.push({
                role: role,
                roleId: role.Uuid,
                roleLabel: label,
                isDefault: role.AutoApplies.join(', ') || '-',
                roleSummary: new Date(parseInt(role.LastUpdated) * 1000).toISOString()
            });
        });
        return data;
    },

    render: function render() {
        var _this4 = this;

        var _state = this.state;
        var searchRoleString = _state.searchRoleString;
        var showTechnical = _state.showTechnical;

        var buttons = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage("user.6"), onClick: this.createRoleAction.bind(this) }), _react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-filter-variant" }),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                desktop: true,
                onChange: function () {
                    _this4.setState({ showTechnical: !showTechnical }, function () {
                        _this4.load();
                    });
                }
            },
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.hide', 'role_editor'), value: "hide", rightIcon: showTechnical ? null : _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) }),
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.show', 'role_editor'), value: "show", rightIcon: showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        )];

        var centerContent = _react2['default'].createElement(
            'div',
            { style: { height: 40, padding: '0px 20px', width: 240, display: 'inline-block' } },
            _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, hintText: this.context.getMessage('47', 'role_editor') + '...', value: searchRoleString || '', onChange: function (e, v) {
                    return _this4.setState({ searchRoleString: v });
                } })
        );
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var columns = [{ name: 'roleLabel', label: this.context.getMessage('32', 'role_editor'), style: { width: '35%', fontSize: 15 }, headerStyle: { width: '35%' } }, { name: 'roleSummary', label: this.context.getMessage('last_update', 'role_editor'), hideSmall: true }, { name: 'isDefault', label: this.context.getMessage('114', 'settings'), style: { width: '20%' }, headerStyle: { width: '20%' }, hideSmall: true }, { name: 'actions', label: '', style: { width: 80 }, headerStyle: { width: 80 }, renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', onTouchTap: function () {
                        _this4.deleteAction(row.roleId);
                    }, onClick: function (e) {
                        e.stopPropagation();
                    }, iconStyle: iconStyle });
            } }];
        var data = this.computeTableData(searchRoleString);

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('69', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: buttons,
                centerContent: centerContent,
                reloadAction: function () {
                    _this4.load();
                },
                loading: this.state.loading
            }),
            _react2['default'].createElement(AdminComponents.SubHeader, { legend: this.context.getMessage("dashboard.description", "role_editor") }),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 16 }, className: "horizontal-layout layout-fill" },
                _react2['default'].createElement(MaterialTable, {
                    data: data,
                    columns: columns,
                    onSelectRows: this.openTableRows.bind(this),
                    deselectOnClickAway: true,
                    showCheckboxes: false
                })
            )
        );
    }

});

exports['default'] = RolesDashboard;
module.exports = exports['default'];
