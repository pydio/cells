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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _editorWsEditor = require('../editor/WsEditor');

var _editorWsEditor2 = _interopRequireDefault(_editorWsEditor);

var _WorkspaceList = require('./WorkspaceList');

var _WorkspaceList2 = _interopRequireDefault(_WorkspaceList);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;

var WsDashboard = _react2['default'].createClass({
    displayName: 'WsDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        accessByName: _react2['default'].PropTypes.func.isRequired,
        advanced: _react2['default'].PropTypes.boolean
    },

    getInitialState: function getInitialState() {
        return { selectedNode: null, searchString: '' };
    },

    dirtyEditor: function dirtyEditor() {
        var pydio = this.props.pydio;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!confirm(pydio.MessageHash["role_editor.19"])) {
                return true;
            }
        }
        return false;
    },

    openWorkspace: function openWorkspace(workspace) {
        var _this = this;

        if (this.dirtyEditor()) {
            return;
        }
        var editor = _editorWsEditor2['default'];
        var editorNode = _pydioUtilXml2['default'].XPathSelectSingleNode(this.props.pydio.getXmlRegistry(), '//client_configs/component_config[@component="AdminWorkspaces.Dashboard"]/editor');
        if (editorNode) {
            editor = editorNode.getAttribute('namespace') + '.' + editorNode.getAttribute('component');
        }
        var _props = this.props;
        var pydio = _props.pydio;
        var advanced = _props.advanced;
        var accessByName = _props.accessByName;

        var editorData = {
            COMPONENT: editor,
            PROPS: {
                ref: "editor",
                pydio: pydio,
                workspace: workspace,
                closeEditor: this.closeWorkspace,
                advanced: advanced,
                reloadList: function reloadList() {
                    _this.refs['workspacesList'].reload();
                }
            }
        };
        this.props.openRightPane(editorData);
        return true;
    },

    closeWorkspace: function closeWorkspace() {
        if (!this.dirtyEditor()) {
            this.props.closeRightPane();
        }
    },

    showWorkspaceCreator: function showWorkspaceCreator(type) {
        var _this2 = this;

        var _props2 = this.props;
        var pydio = _props2.pydio;
        var advanced = _props2.advanced;

        var editorData = {
            COMPONENT: _editorWsEditor2['default'],
            PROPS: {
                ref: "editor",
                type: type,
                pydio: pydio,
                advanced: advanced,
                closeEditor: this.closeWorkspace,
                reloadList: function reloadList() {
                    _this2.refs['workspacesList'].reload();
                }
            }
        };
        this.props.openRightPane(editorData);
    },

    reloadWorkspaceList: function reloadWorkspaceList() {
        this.refs.workspacesList.reload();
    },

    render: function render() {
        var _this3 = this;

        var _props3 = this.props;
        var pydio = _props3.pydio;
        var advanced = _props3.advanced;
        var currentNode = _props3.currentNode;
        var accessByName = _props3.accessByName;
        var muiTheme = _props3.muiTheme;
        var _state = this.state;
        var searchString = _state.searchString;
        var loading = _state.loading;

        var adminStyles = AdminComponents.AdminStyles(muiTheme.palette);

        var buttons = [];
        if (accessByName('Create')) {
            buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({
                primary: true,
                label: this.context.getMessage('ws.3'),
                onTouchTap: this.showWorkspaceCreator
            }, adminStyles.props.header.flatButton)));
        }

        var searchBox = _react2['default'].createElement(
            'div',
            { style: { display: 'flex' } },
            _react2['default'].createElement('div', { style: { flex: 1 } }),
            _react2['default'].createElement(
                'div',
                { style: { width: 190 } },
                _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: 'Search workspaces', value: searchString, onChange: function (e, v) {
                        return _this3.setState({ searchString: v });
                    } })
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'main-layout-nav-to-stack vertical-layout workspaces-board' },
            _react2['default'].createElement(AdminComponents.Header, {
                title: currentNode.getLabel(),
                icon: 'mdi mdi-folder-open',
                actions: buttons,
                centerContent: searchBox,
                reloadAction: this.reloadWorkspaceList,
                loading: loading
            }),
            _react2['default'].createElement(
                'div',
                { className: 'layout-fill' },
                _react2['default'].createElement(AdminComponents.SubHeader, { legend: this.context.getMessage('ws.dashboard', 'ajxp_admin') }),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    _extends({}, adminStyles.body.block.props, { style: adminStyles.body.block.container }),
                    _react2['default'].createElement(_WorkspaceList2['default'], {
                        ref: 'workspacesList',
                        pydio: pydio,
                        openSelection: this.openWorkspace,
                        advanced: advanced,
                        editable: accessByName('Create'),
                        onLoadState: function (state) {
                            _this3.setState({ loading: state });
                        },
                        tableStyles: adminStyles.body.tableMaster,
                        filterString: searchString
                    })
                )
            )
        );
    }

});

exports['default'] = (0, _materialUiStyles.muiThemeable)()(WsDashboard);
module.exports = exports['default'];
