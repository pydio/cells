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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _metaMetaSourceForm = require('./meta/MetaSourceForm');

var _metaMetaSourceForm2 = _interopRequireDefault(_metaMetaSourceForm);

var _boardWsDashboard = require('./board/WsDashboard');

var _boardWsDashboard2 = _interopRequireDefault(_boardWsDashboard);

var _modelWorkspace = require('./model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

var _panelSharesList = require('./panel/SharesList');

var _panelSharesList2 = _interopRequireDefault(_panelSharesList);

var _editorTplFieldsChooser = require('./editor/TplFieldsChooser');

var _editorTplFieldsChooser2 = _interopRequireDefault(_editorTplFieldsChooser);

var _metaMetaList = require('./meta/MetaList');

var _metaMetaList2 = _interopRequireDefault(_metaMetaList);

var _panelWorkspaceSummary = require('./panel/WorkspaceSummary');

var _panelWorkspaceSummary2 = _interopRequireDefault(_panelWorkspaceSummary);

var _editorWorkspaceEditor = require('./editor/WorkspaceEditor');

var _editorWorkspaceEditor2 = _interopRequireDefault(_editorWorkspaceEditor);

var _boardVirtualNodes = require('./board/VirtualNodes');

var _boardVirtualNodes2 = _interopRequireDefault(_boardVirtualNodes);

var _boardDataSourcesBoard = require('./board/DataSourcesBoard');

var _boardDataSourcesBoard2 = _interopRequireDefault(_boardDataSourcesBoard);

var _boardMetadataBoard = require('./board/MetadataBoard');

var _boardMetadataBoard2 = _interopRequireDefault(_boardMetadataBoard);

window.AdminWorkspaces = {
  MetaSourceForm: _metaMetaSourceForm2['default'],
  Workspace: _modelWorkspace2['default'],
  SharesList: _panelSharesList2['default'],
  TplFieldsChooser: _editorTplFieldsChooser2['default'],
  MetaList: _metaMetaList2['default'],
  WorkspaceSummary: _panelWorkspaceSummary2['default'],
  WorkspaceEditor: _editorWorkspaceEditor2['default'],
  VirtualNodes: _boardVirtualNodes2['default'],
  WsDashboard: _boardWsDashboard2['default'],
  DataSourcesBoard: _boardDataSourcesBoard2['default'],
  MetadataBoard: _boardMetadataBoard2['default']
};
