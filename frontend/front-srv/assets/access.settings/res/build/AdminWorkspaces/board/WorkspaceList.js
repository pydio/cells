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

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;
exports['default'] = _react2['default'].createClass({
    displayName: 'WorkspaceList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openSelection: _react2['default'].PropTypes.func,
        advanced: _react2['default'].PropTypes.boolean
    },

    getInitialState: function getInitialState() {
        return { workspaces: [], loading: false };
    },

    startLoad: function startLoad() {
        if (this.props.onLoadState) {
            this.props.onLoadState(true);
        }
        this.setState({ loading: true });
    },

    endLoad: function endLoad() {
        if (this.props.onLoadState) {
            this.props.onLoadState(false);
        }
        this.setState({ loading: false });
    },

    reload: function reload() {
        var _this = this;

        this.startLoad();
        _modelWs2['default'].listWorkspaces().then(function (response) {
            _this.endLoad();
            _this.setState({ workspaces: response.Workspaces || [] });
        })['catch'](function (e) {
            _this.endLoad();
        });
    },

    componentDidMount: function componentDidMount() {
        this.reload();
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.props.openSelection(rows[0].workspace);
        }
    },

    deleteAction: function deleteAction(workspace) {
        var _this2 = this;

        var pydio = this.props.pydio;

        pydio.UI.openConfirmDialog({
            message: pydio.MessageHash['settings.35'],
            destructive: [workspace.Label],
            validCallback: function validCallback() {
                var ws = new _modelWs2['default'](workspace);
                ws.remove().then(function () {
                    _this2.reload();
                });
            }
        });
    },

    computeTableData: function computeTableData() {
        var data = [];
        var filterString = this.props.filterString;
        var workspaces = this.state.workspaces;

        workspaces.map(function (workspace) {
            var summary = ""; // compute root nodes list
            if (workspace.RootNodes) {
                summary = Object.keys(workspace.RootNodes).map(function (k) {
                    return _pydioUtilLang2['default'].trimRight(workspace.RootNodes[k].Path, '/');
                }).join(', ');
            }
            var syncable = false;
            if (workspace.Attributes) {
                try {
                    var atts = JSON.parse(workspace.Attributes);
                    if (atts['ALLOW_SYNC'] === true || atts['ALLOW_SYNC'] === "true") {
                        syncable = true;
                    }
                } catch (e) {}
            }
            if (filterString) {
                var search = filterString.toLowerCase();
                var l = workspace.Label && workspace.Label.toLowerCase().indexOf(search) >= 0;
                var d = workspace.Description && workspace.Description.toLowerCase().indexOf(search) >= 0;
                var ss = summary && summary.toLowerCase().indexOf(search) >= 0;
                if (!(l || d || ss)) {
                    return;
                }
            }
            data.push({
                workspace: workspace,
                label: workspace.Label,
                description: workspace.Description,
                slug: workspace.Slug,
                summary: summary,
                syncable: syncable
            });
        });
        data.sort(_pydioUtilLang2['default'].arraySorter('label', false, true));
        return data;
    },

    render: function render() {
        var _this3 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var advanced = _props.advanced;
        var editable = _props.editable;
        var tableStyles = _props.tableStyles;
        var openSelection = _props.openSelection;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.' + id];
        };
        var s = function s(id) {
            return pydio.MessageHash['settings.' + id];
        };

        var columns = [{ name: 'label', label: s('8'), style: { width: '20%', fontSize: 15 }, headerStyle: { width: '20%' }, sorter: { type: 'string', 'default': 'true' } }, { name: 'description', label: s('103'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' }, sorter: { type: 'string' } }, { name: 'summary', label: m('ws.board.summary'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' }, sorter: { type: 'string' } }];
        if (advanced) {
            columns.push({
                name: 'syncable', label: m('ws.board.syncable'), style: { width: '10%', textAlign: 'center' }, headerStyle: { width: '10%', textAlign: 'center' }, sorter: { type: 'number', sortValue: function sortValue(row) {
                        return row.syncable ? 1 : 0;
                    } }, renderCell: function renderCell(row) {
                    return _react2['default'].createElement('span', { className: "mdi mdi-check", style: { fontSize: 18, opacity: row.syncable ? 1 : 0 } });
                } });
        }

        columns.push({ name: 'slug', label: m('ws.5'), style: { width: '20%' }, headerStyle: { width: '20%' }, sorter: { type: 'string' } });

        var loading = this.state.loading;

        var data = this.computeTableData();
        var actions = [];
        if (editable) {
            actions.push({
                iconClassName: "mdi mdi-pencil",
                tooltip: 'Edit Workspace',
                onTouchTap: function onTouchTap(row) {
                    openSelection(row.workspace);
                },
                disable: function disable(row) {
                    return !row.workspace.PoliciesContextEditable;
                }
            });
        }
        var repos = pydio.user.getRepositoriesList();
        actions.push({
            iconClassName: 'mdi mdi-open-in-new',
            tooltip: 'Open this workspace...',
            onTouchTap: function onTouchTap(row) {
                pydio.triggerRepositoryChange(row.workspace.UUID);
            },
            disable: function disable(row) {
                return !repos.has(row.workspace.UUID);
            }
        });
        if (editable) {
            actions.push({
                iconClassName: "mdi mdi-delete",
                onTouchTap: function onTouchTap(row) {
                    _this3.deleteAction(row.workspace);
                },
                disable: function disable(row) {
                    return !row.workspace.PoliciesContextEditable;
                }
            });
        }

        return _react2['default'].createElement(MaterialTable, {
            data: data,
            columns: columns,
            actions: actions,
            onSelectRows: editable ? this.openTableRows.bind(this) : null,
            deselectOnClickAway: true,
            showCheckboxes: false,
            emptyStateString: loading ? m('home.6') : m('ws.board.empty'),
            masterStyles: tableStyles,
            paginate: [10, 25, 50, 100],
            defaultPageSize: 25
        });
    }

});
module.exports = exports['default'];
