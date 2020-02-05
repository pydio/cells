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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

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

    reload: function reload() {
        var _this = this;

        this.setState({ loading: true });
        _pydio2['default'].startLoading();
        _modelWs2['default'].listWorkspaces().then(function (response) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false, workspaces: response.Workspaces || [] });
        })['catch'](function (e) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        this.reload();
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.props.openSelection(rows[0].payload);
        }
    },

    computeTableData: function computeTableData() {
        var data = [];
        var pydio = this.props.pydio;
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
            data.push({
                payload: workspace,
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
        var _props = this.props;
        var pydio = _props.pydio;
        var advanced = _props.advanced;
        var editable = _props.editable;
        var tableStyles = _props.tableStyles;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.' + id];
        };
        var s = function s(id) {
            return pydio.MessageHash['settings.' + id];
        };

        var columns = [{ name: 'label', label: s('8'), style: { width: '20%', fontSize: 15 }, headerStyle: { width: '20%' } }, { name: 'description', label: s('103'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' } }, { name: 'summary', label: m('ws.board.summary'), hideSmall: true, style: { width: '25%' }, headerStyle: { width: '25%' } }];
        if (advanced) {
            columns.push({
                name: 'syncable', label: m('ws.board.syncable'), style: { width: '10%', textAlign: 'center' }, headerStyle: { width: '10%', textAlign: 'center' }, renderCell: function renderCell(row) {
                    return _react2['default'].createElement('span', { className: "mdi mdi-check", style: { fontSize: 18, opacity: row.syncable ? 1 : 0 } });
                } });
        }

        columns.push({ name: 'slug', label: m('ws.5'), style: { width: '20%' }, headerStyle: { width: '20%' } });

        var loading = this.state.loading;

        var data = this.computeTableData();

        return _react2['default'].createElement(MaterialTable, {
            data: data,
            columns: columns,
            onSelectRows: editable ? this.openTableRows.bind(this) : null,
            deselectOnClickAway: true,
            showCheckboxes: false,
            emptyStateString: loading ? m('home.6') : m('ws.board.empty'),
            masterStyles: tableStyles
        });
    }

});
module.exports = exports['default'];
