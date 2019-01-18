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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _OpenNodesModel = require('./OpenNodesModel');

var _OpenNodesModel2 = _interopRequireDefault(_OpenNodesModel);

var _viewsMainFilesList = require('./views/MainFilesList');

var _viewsMainFilesList2 = _interopRequireDefault(_viewsMainFilesList);

var _viewsBreadcrumb = require('./views/Breadcrumb');

var _viewsBreadcrumb2 = _interopRequireDefault(_viewsBreadcrumb);

var _viewsFilePreview = require('./views/FilePreview');

var _viewsFilePreview2 = _interopRequireDefault(_viewsFilePreview);

var _viewsFSTemplate = require('./views/FSTemplate');

var _viewsFSTemplate2 = _interopRequireDefault(_viewsFSTemplate);

var _viewsEditionPanel = require('./views/EditionPanel');

var _viewsEditionPanel2 = _interopRequireDefault(_viewsEditionPanel);

var _search = require('./search');

var _wslistWorkspacesList = require('./wslist/WorkspacesList');

var _wslistWorkspacesList2 = _interopRequireDefault(_wslistWorkspacesList);

var _wslistWorkspacesListMaterial = require('./wslist/WorkspacesListMaterial');

var _wslistWorkspacesListMaterial2 = _interopRequireDefault(_wslistWorkspacesListMaterial);

var _wslistWorkspacePickerDialog = require('./wslist/WorkspacePickerDialog');

var _wslistWorkspacePickerDialog2 = _interopRequireDefault(_wslistWorkspacePickerDialog);

var _leftnavLeftPanel = require('./leftnav/LeftPanel');

var _leftnavLeftPanel2 = _interopRequireDefault(_leftnavLeftPanel);

var _leftnavDynamicLeftPanel = require('./leftnav/DynamicLeftPanel');

var _leftnavDynamicLeftPanel2 = _interopRequireDefault(_leftnavDynamicLeftPanel);

var _leftnavUserWidget = require('./leftnav/UserWidget');

var _leftnavUserWidget2 = _interopRequireDefault(_leftnavUserWidget);

var _viewsTourGuide = require('./views/TourGuide');

var _viewsTourGuide2 = _interopRequireDefault(_viewsTourGuide);

var _viewsMasterLayout = require('./views/MasterLayout');

var _viewsMasterLayout2 = _interopRequireDefault(_viewsMasterLayout);

var _detailpanesInfoPanel = require('./detailpanes/InfoPanel');

var _detailpanesInfoPanel2 = _interopRequireDefault(_detailpanesInfoPanel);

var _detailpanesInfoPanelCard = require('./detailpanes/InfoPanelCard');

var _detailpanesInfoPanelCard2 = _interopRequireDefault(_detailpanesInfoPanelCard);

var _detailpanesRootNode = require('./detailpanes/RootNode');

var _detailpanesRootNode2 = _interopRequireDefault(_detailpanesRootNode);

var _detailpanesGenericInfoCard = require('./detailpanes/GenericInfoCard');

var _detailpanesGenericInfoCard2 = _interopRequireDefault(_detailpanesGenericInfoCard);

var _detailpanesFileInfoCard = require('./detailpanes/FileInfoCard');

var _detailpanesFileInfoCard2 = _interopRequireDefault(_detailpanesFileInfoCard);

var _editorComponentsEditor = require('./editor/components/editor');

var classes = {
    OpenNodesModel: _OpenNodesModel2['default'],
    MainFilesList: _viewsMainFilesList2['default'],
    EditionPanel: _viewsEditionPanel2['default'],
    Breadcrumb: _viewsBreadcrumb2['default'],
    SearchForm: _search.SearchForm,
    FilePreview: _viewsFilePreview2['default'],
    FSTemplate: _viewsFSTemplate2['default'],
    WorkspacesList: _wslistWorkspacesList2['default'],
    WorkspacesListMaterial: _wslistWorkspacesListMaterial2['default'],
    WorkspacePickerDialog: _wslistWorkspacePickerDialog2['default'],
    LeftPanel: _leftnavLeftPanel2['default'],
    DynamicLeftPanel: _leftnavDynamicLeftPanel2['default'],
    UserWidget: _leftnavUserWidget2['default'],
    TourGuide: _viewsTourGuide2['default'],
    MasterLayout: _viewsMasterLayout2['default'],

    InfoPanel: _detailpanesInfoPanel2['default'],
    InfoPanelCard: _detailpanesInfoPanelCard2['default'],
    InfoRootNode: _detailpanesRootNode2['default'],
    FileInfoCard: _detailpanesFileInfoCard2['default'],
    GenericInfoCard: _detailpanesGenericInfoCard2['default'],

    Editor: _editorComponentsEditor.Editor
};

exports['default'] = classes;
module.exports = exports['default'];
