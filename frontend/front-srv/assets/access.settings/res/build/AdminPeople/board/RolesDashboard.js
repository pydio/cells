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

var _editorUtilClassLoader = require("../editor/util/ClassLoader");

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

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
        if (rows.length && rows[0].role.PoliciesContextEditable) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor: function openRoleEditor(idmRole) {
        var _this2 = this;

        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props = this.props;
        var pydio = _props.pydio;
        var rolesEditorClass = _props.rolesEditorClass;
        var rolesEditorProps = _props.rolesEditorProps;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        (0, _editorUtilClassLoader.loadEditorClass)(rolesEditorClass, _editorEditor2['default']).then(function (component) {
            _this2.props.openRightPane({
                COMPONENT: component,
                PROPS: _extends({
                    ref: "editor",
                    idmRole: idmRole,
                    pydio: pydio,
                    initialEditSection: initialSection,
                    onRequestTabClose: _this2.closeRoleEditor
                }, rolesEditorProps)
            });
        });
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
        var _this3 = this;

        var pydio = this.props.pydio;

        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['settings.126'],
            destructive: [roleId],
            validCallback: function validCallback() {
                _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteRole(roleId).then(function () {
                    _this3.load();
                });
            }
        });
    },

    createRoleAction: function createRoleAction() {
        var _this4 = this;

        pydio.UI.openComponentInModal('AdminPeople', 'Forms.CreateRoleOrGroupForm', {
            type: 'role',
            roleNode: this.state.currentNode,
            openRoleEditor: this.openRoleEditor.bind(this),
            reload: function reload() {
                _this4.load();
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
                lastUpdated: role.LastUpdated
            });
        });
        return data;
    },

    render: function render() {
        var _this5 = this;

        var _props2 = this.props;
        var muiTheme = _props2.muiTheme;
        var accessByName = _props2.accessByName;

        var styles = AdminComponents.AdminStyles(muiTheme.palette);
        var _state = this.state;
        var searchRoleString = _state.searchRoleString;
        var showTechnical = _state.showTechnical;

        var hasEditRight = accessByName('Create');

        // Header Buttons & edit functions
        var selectRows = null;
        var buttons = [];
        if (hasEditRight) {
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({}, styles.props.header.flatButton, { primary: true, label: this.context.getMessage("user.6"), onClick: this.createRoleAction.bind(this) })));
            selectRows = this.openTableRows.bind(this);
        }
        buttons.push(_react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-filter-variant" }, styles.props.header.iconButton)),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                onChange: function () {
                    _this5.setState({ showTechnical: !showTechnical }, function () {
                        _this5.load();
                    });
                }
            },
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.show', 'role_editor'), value: "show", rightIcon: showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null }),
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.hide', 'role_editor'), value: "hide", rightIcon: !showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        ));

        var searchBox = _react2['default'].createElement(
            'div',
            { style: { display: 'flex' } },
            _react2['default'].createElement('div', { style: { flex: 1 } }),
            _react2['default'].createElement(
                'div',
                { style: { width: 190 } },
                _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: this.context.getMessage('47', 'role_editor') + '...', value: searchRoleString || '', onChange: function (e, v) {
                        return _this5.setState({ searchRoleString: v });
                    } })
            )
        );
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var columns = [{ name: 'roleLabel', label: this.context.getMessage('32', 'role_editor'), style: { width: '35%', fontSize: 15 }, headerStyle: { width: '35%' }, sorter: { type: 'string', 'default': true } }, { name: 'lastUpdated', useMoment: true, label: this.context.getMessage('last_update', 'role_editor'), hideSmall: true, sorter: { type: 'number' } }, { name: 'isDefault', label: this.context.getMessage('114', 'settings'), style: { width: '20%' }, headerStyle: { width: '20%' }, hideSmall: true, sorter: { type: 'string' } }];

        var tableActions = [];
        if (hasEditRight) {
            tableActions.push({
                iconClassName: "mdi mdi-pencil",
                tooltip: 'Edit',
                onTouchTap: function onTouchTap(row) {
                    _this5.openRoleEditor(row.role);
                },
                disable: function disable(row) {
                    return !row.role.PoliciesContextEditable;
                }
            });
            tableActions.push({
                iconClassName: "mdi mdi-delete",
                tooltip: 'Delete',
                onTouchTap: function onTouchTap(row) {
                    _this5.deleteAction(row.role.Uuid);
                },
                disable: function disable(row) {
                    return !row.role.PoliciesContextEditable;
                }
            });
        }
        var data = this.computeTableData(searchRoleString);

        var _AdminComponents$AdminStyles = AdminComponents.AdminStyles();

        var body = _AdminComponents$AdminStyles.body;
        var tableMaster = body.tableMaster;

        var blockProps = body.block.props;
        var blockStyle = body.block.container;

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('69', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: buttons,
                centerContent: searchBox,
                reloadAction: function () {
                    _this5.load();
                },
                loading: this.state.loading
            }),
            _react2['default'].createElement(
                'div',
                { className: "layout-fill" },
                _react2['default'].createElement(AdminComponents.SubHeader, { legend: this.context.getMessage("dashboard.description", "role_editor") }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    _extends({}, blockProps, { style: blockStyle }),
                    _react2['default'].createElement(MaterialTable, {
                        data: data,
                        columns: columns,
                        actions: tableActions,
                        onSelectRows: selectRows,
                        deselectOnClickAway: true,
                        showCheckboxes: false,
                        masterStyles: tableMaster,
                        paginate: [10, 25, 50, 100]
                    })
                )
            )
        );
    }

});

exports['default'] = RolesDashboard = muiThemeable()(RolesDashboard);
exports['default'] = RolesDashboard;
module.exports = exports['default'];
