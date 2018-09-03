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

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _editorWsEditor = require('../editor/WsEditor');

var _editorWsEditor2 = _interopRequireDefault(_editorWsEditor);

var _WorkspaceList = require('./WorkspaceList');

var _WorkspaceList2 = _interopRequireDefault(_WorkspaceList);

var PydioDataModel = require('pydio/model/data-model');
var AjxpNode = require('pydio/model/node');

exports['default'] = _react2['default'].createClass({
    displayName: 'WsDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(AjxpNode).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        filter: _react2['default'].PropTypes.string
    },

    getInitialState: function getInitialState() {
        return { selectedNode: null, filter: this.props.filter || 'workspaces' };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this._setLoading = function () {
            _this.setState({ loading: true });
        };
        this._stopLoading = function () {
            _this.setState({ loading: false });
        };
        this.props.currentNode.observe('loaded', this._stopLoading);
        this.props.currentNode.observe('loading', this._setLoading);
    },

    componentWillUnmount: function componentWillUnmount() {
        this.props.currentNode.stopObserving('loaded', this._stopLoading);
        this.props.currentNode.stopObserving('loading', this._setLoading);
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
        var _this2 = this;

        if (this.dirtyEditor()) {
            return;
        }
        var editor = _editorWsEditor2['default'];
        var editorNode = _pydioUtilXml2['default'].XPathSelectSingleNode(this.props.pydio.getXmlRegistry(), '//client_configs/component_config[@component="AdminWorkspaces.Dashboard"]/editor');
        if (editorNode) {
            editor = editorNode.getAttribute('namespace') + '.' + editorNode.getAttribute('component');
        }
        var pydio = this.props.pydio;

        var editorData = {
            COMPONENT: editor,
            PROPS: {
                ref: "editor",
                pydio: pydio,
                workspace: workspace,
                closeEditor: this.closeWorkspace,
                reloadList: function reloadList() {
                    _this2.refs['workspacesList'].reload();
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
        var _this3 = this;

        var pydio = this.props.pydio;

        var editorData = {
            COMPONENT: _editorWsEditor2['default'],
            PROPS: {
                ref: "editor",
                type: type,
                pydio: pydio,
                closeEditor: this.closeWorkspace,
                reloadList: function reloadList() {
                    _this3.refs['workspacesList'].reload();
                }
            }
        };
        this.props.openRightPane(editorData);
    },

    reloadWorkspaceList: function reloadWorkspaceList() {
        this.refs.workspacesList.reload();
    },

    render: function render() {
        var buttons = [];
        var icon = undefined;
        var title = this.props.currentNode.getLabel();
        buttons.push(_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage('ws.3'), onTouchTap: this.showWorkspaceCreator }));
        icon = 'mdi mdi-folder-open';

        return _react2['default'].createElement(
            'div',
            { className: 'main-layout-nav-to-stack workspaces-board' },
            _react2['default'].createElement(
                'div',
                { className: 'vertical-layout', style: { width: '100%' } },
                _react2['default'].createElement(AdminComponents.Header, {
                    title: title,
                    icon: icon,
                    actions: buttons,
                    reloadAction: this.reloadWorkspaceList,
                    loading: this.state.loading
                }),
                _react2['default'].createElement(AdminComponents.SubHeader, { legend: 'Workspaces define the main access point to your data for the users. Make sure to define at least one datasource to be able to create a workspace that will point to a path of this datasource.' }),
                _react2['default'].createElement(
                    'div',
                    { className: 'layout-fill' },
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 1, style: { margin: 16 } },
                        _react2['default'].createElement(_WorkspaceList2['default'], {
                            ref: 'workspacesList',
                            dataModel: this.props.dataModel,
                            rootNode: this.props.rootNode,
                            currentNode: this.props.currentNode,
                            openSelection: this.openWorkspace,
                            filter: this.state.filter
                        })
                    )
                )
            )
        );
    }

});
module.exports = exports['default'];
