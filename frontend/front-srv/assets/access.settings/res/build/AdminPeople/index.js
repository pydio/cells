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

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardRolesDashboard = require('./board/RolesDashboard');

var _boardRolesDashboard2 = _interopRequireDefault(_boardRolesDashboard);

var _boardPoliciesBoard = require('./board/PoliciesBoard');

var _boardPoliciesBoard2 = _interopRequireDefault(_boardPoliciesBoard);

var _boardCallbacks = require('./board/Callbacks');

var _boardCallbacks2 = _interopRequireDefault(_boardCallbacks);

var _formsCreateUserForm = require('./forms/CreateUserForm');

var _formsCreateUserForm2 = _interopRequireDefault(_formsCreateUserForm);

var _formsCreateRoleOrGroupForm = require('./forms/CreateRoleOrGroupForm');

var _formsCreateRoleOrGroupForm2 = _interopRequireDefault(_formsCreateRoleOrGroupForm);

var _editorEditor = require('./editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _editorUserUserPasswordDialog = require('./editor/user/UserPasswordDialog');

var _editorUserUserPasswordDialog2 = _interopRequireDefault(_editorUserUserPasswordDialog);

var _editorUserUserRolesPicker = require('./editor/user/UserRolesPicker');

var _editorUserUserRolesPicker2 = _interopRequireDefault(_editorUserUserRolesPicker);

var _editorPanelSharesList = require('./editor/panel/SharesList');

var _editorPanelSharesList2 = _interopRequireDefault(_editorPanelSharesList);

var _editorUtilMessagesMixin = require('./editor/util/MessagesMixin');

var _editorParamsParameterCreate = require('./editor/params/ParameterCreate');

var _editorParamsParameterCreate2 = _interopRequireDefault(_editorParamsParameterCreate);

window.AdminPeople = {
  RoleEditor: _editorEditor2['default'],
  RoleMessagesConsumerMixin: _editorUtilMessagesMixin.RoleMessagesConsumerMixin,
  UserPasswordDialog: _editorUserUserPasswordDialog2['default'],
  UserRolesPicker: _editorUserUserRolesPicker2['default'],
  SharesList: _editorPanelSharesList2['default'],
  CreateUserForm: _formsCreateUserForm2['default'],
  CreateRoleOrGroupForm: _formsCreateRoleOrGroupForm2['default'],
  ParameterCreate: _editorParamsParameterCreate2['default'],
  Callbacks: _boardCallbacks2['default'],

  Dashboard: _boardDashboard2['default'],
  RolesDashboard: _boardRolesDashboard2['default'],
  PoliciesBoard: _boardPoliciesBoard2['default']
};
