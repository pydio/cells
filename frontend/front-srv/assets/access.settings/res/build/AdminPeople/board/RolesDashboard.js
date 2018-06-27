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

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var RolesDashboard = _react2['default'].createClass({
    displayName: 'RolesDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            currentNode: this.props.currentNode,
            dataModel: this.props.dataModel,
            loading: false
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this._setLoading = function () {
            _this.setState({ loading: true }, function () {
                _this.forceUpdate();
            });
        };
        this._stopLoading = function () {
            _this.setState({ loading: false }, function () {
                _this.forceUpdate();
            });
        };
        this.props.currentNode.observe('loaded', this._stopLoading);
        this.props.currentNode.observe('loading', this._setLoading);
        setTimeout(function () {
            _this.props.currentNode.reload();
        }, 100);
    },

    componentWillUnmount: function componentWillUnmount() {
        this.props.currentNode.stopObserving('loaded', this._stopLoading);
        this.props.currentNode.stopObserving('loading', this._setLoading);
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.openRoleEditor(rows[0].node);
        }
    },

    openRoleEditor: function openRoleEditor(node) {
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
                node: node,
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

    deleteAction: function deleteAction(node) {
        var dm = new _pydioModelDataModel2['default']();
        dm.setSelectedNodes([node]);
        _pydioHttpResourcesManager2['default'].loadClassesAndApply(['AdminActions'], function () {
            AdminActions.Callbacks.deleteAction(null, [dm]);
        });
    },

    createRoleAction: function createRoleAction() {
        pydio.UI.openComponentInModal('AdminPeople', 'CreateRoleOrGroupForm', { type: 'role', roleNode: this.state.currentNode, openRoleEditor: this.openRoleEditor.bind(this) });
    },

    computeTableData: function computeTableData(currentNode, searchRoleString) {
        var _this2 = this;

        var data = [];
        currentNode.getChildren().forEach(function (child) {
            var label = child.getLabel();
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            var roleSummary = '';
            var role = JSON.parse(child.getMetadata().get('role'));
            if (role && role.ACL && Object.keys(role.ACL).length > 1) {
                roleSummary = _this2.context.getMessage('user.10').replace("%i", Object.keys(role.ACL).length - 1);
            }
            data.push({
                node: child,
                roleId: child.getMetadata().get('role_id'),
                roleLabel: label,
                isDefault: child.getMetadata().get('is_default'),
                roleSummary: roleSummary
            });
        });
        return data;
    },

    render: function render() {
        var _this3 = this;

        var _state = this.state;
        var currentNode = _state.currentNode;
        var dataModel = _state.dataModel;
        var searchRoleString = _state.searchRoleString;

        var buttons = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage("user.6"), onClick: this.createRoleAction.bind(this) })];

        var centerContent = _react2['default'].createElement(
            'div',
            { style: { height: 40, padding: '0px 20px', width: 240, display: 'inline-block' } },
            _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, hintText: this.context.getMessage('47', 'role_editor') + '...', value: searchRoleString || '', onChange: function (e, v) {
                    return _this3.setState({ searchRoleString: v });
                } })
        );
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var columns = [{ name: 'roleLabel', label: 'Label', style: { width: '35%', fontSize: 15 }, headerStyle: { width: '35%' } }, { name: 'roleSummary', label: 'Summary' }, { name: 'isDefault', label: 'Applies to', style: { width: '20%' }, headerStyle: { width: '20%' } }, { name: 'actions', label: '', style: { width: 80 }, headerStyle: { width: 80 }, renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', onTouchTap: function () {
                        _this3.deleteAction(row.node);
                    }, onClick: function (e) {
                        e.stopPropagation();
                    }, iconStyle: iconStyle });
            } }];
        var data = this.computeTableData(currentNode, searchRoleString);

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('69', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: buttons,
                centerContent: centerContent,
                reloadAction: function () {
                    currentNode.reload();
                },
                loading: this.state.loading
            }),
            _react2['default'].createElement(AdminComponents.SubHeader, { legend: 'Roles are containers for Access Lists to grant access to any workspaces or customize parameters and actions. They can be manually assigned to any users.' }),
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
