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

var _editorACL = require('./editor/ACL');

var _editorACL2 = _interopRequireDefault(_editorACL);

var _editorInfo = require('./editor/Info');

var _editorInfo2 = _interopRequireDefault(_editorInfo);

var _editorModel = require('./editor/Model');

var _editorModel2 = _interopRequireDefault(_editorModel);

var _editorParams = require('./editor/Params');

var _editorParams2 = _interopRequireDefault(_editorParams);

var _editorUser = require('./editor/User');

var _editorUser2 = _interopRequireDefault(_editorUser);

var _editorUtil = require('./editor/Util');

var _editorUtil2 = _interopRequireDefault(_editorUtil);

window.AdminPeople = {
    Callbacks: _boardCallbacks2['default'],

    Dashboard: _boardDashboard2['default'],
    RolesDashboard: _boardRolesDashboard2['default'],
    PoliciesBoard: _boardPoliciesBoard2['default'],

    Editor: {
        Model: _editorModel2['default'], Info: _editorInfo2['default'], ACL: _editorACL2['default'], Params: _editorParams2['default'], User: _editorUser2['default'], Util: _editorUtil2['default']
    },
    Forms: {
        CreateUserForm: _formsCreateUserForm2['default'], CreateRoleOrGroupForm: _formsCreateRoleOrGroupForm2['default']
    }

};
