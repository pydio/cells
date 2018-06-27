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

var _appsDlAppsCard = require('./apps/DlAppsCard');

var _appsDlAppsCard2 = _interopRequireDefault(_appsDlAppsCard);

var _appsQRCodeCard = require('./apps/QRCodeCard');

var _appsQRCodeCard2 = _interopRequireDefault(_appsQRCodeCard);

var _quicksendQuickSendCard = require('./quicksend/QuickSendCard');

var _quicksendQuickSendCard2 = _interopRequireDefault(_quicksendQuickSendCard);

var _quicksendWorkspacePickerDialog = require('./quicksend/WorkspacePickerDialog');

var _quicksendWorkspacePickerDialog2 = _interopRequireDefault(_quicksendWorkspacePickerDialog);

var _recentRecentAccessCard = require('./recent/RecentAccessCard');

var _recentRecentAccessCard2 = _interopRequireDefault(_recentRecentAccessCard);

var _videosVideoCard = require('./videos/VideoCard');

var _videosVideoCard2 = _interopRequireDefault(_videosVideoCard);

var _workspacesWorkspacesListCard = require('./workspaces/WorkspacesListCard');

var _workspacesWorkspacesListCard2 = _interopRequireDefault(_workspacesWorkspacesListCard);

var _recentActivityStreams = require('./recent/ActivityStreams');

var _recentActivityStreams2 = _interopRequireDefault(_recentActivityStreams);

var _boardHomeDashboard = require('./board/HomeDashboard');

var _boardHomeDashboard2 = _interopRequireDefault(_boardHomeDashboard);

exports.DlAppsCard = _appsDlAppsCard2['default'];
exports.QRCodeCard = _appsQRCodeCard2['default'];
exports.QuickSendCard = _quicksendQuickSendCard2['default'];
exports.WorkspacePickerDialog = _quicksendWorkspacePickerDialog2['default'];
exports.RecentAccessCard = _recentRecentAccessCard2['default'];
exports.VideoCard = _videosVideoCard2['default'];
exports.WorkspacesListCard = _workspacesWorkspacesListCard2['default'];
exports.HomeDashboard = _boardHomeDashboard2['default'];
exports.ActivityStreamsPanel = _recentActivityStreams2['default'];
