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

import Dashboard from './board/Dashboard'
import RolesDashboard from './board/RolesDashboard'
import PoliciesBoard from './board/PoliciesBoard'
import DirectoriesBoard from './board/DirectoriesBoard'
import Callbacks from './board/Callbacks'

import CreateUserForm from './forms/CreateUserForm'
import CreateRoleOrGroupForm from './forms/CreateRoleOrGroupForm'
import Editor from './editor/Editor'
import UserPasswordDialog from './editor/user/UserPasswordDialog'
import UserRolesPicker from './editor/user/UserRolesPicker'
import SharesList from './editor/panel/SharesList'
import {RoleMessagesConsumerMixin} from './editor/util/MessagesMixin'
import ParameterCreate from './editor/params/ParameterCreate'

window.AdminPeople = {
    RoleEditor              : Editor,
    RoleMessagesConsumerMixin,
    UserPasswordDialog,
    UserRolesPicker,
    SharesList,
    CreateUserForm,
    CreateRoleOrGroupForm,
    ParameterCreate,
    Callbacks,

    Dashboard,
    RolesDashboard,
    PoliciesBoard,
    DirectoriesBoard
};