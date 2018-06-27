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

import AdminDashboard from './board/AdminDashboard'
import SimpleDashboard from './board/SimpleDashboard'
import GroupAdminDashboard from './board/GroupAdminDashboard'
import TabBoard from './board/TabBoard'
import Header from './board/Header'
import SubHeader from './board/SubHeader'

import {MessagesConsumerMixin, PydioConsumerMixin} from './util/Mixins'
import NavigationHelper from './util/NavigationHelper'
import MenuItemListener from './util/MenuItemListener'
import DNDActionsManager from './util/DNDActionsManager'
import CodeMirrorField from './util/CodeMirrorField'

import GraphBadge from './cards/GraphBadge'
import GraphCard from './cards/GraphCard'
import MostActiveBadge from './cards/MostActiveBadge'
import QuickLinks from './cards/QuickLinks'
import RecentLogs from './cards/RecentLogs'
import ServicesStatus from './cards/ServicesStatus'
import ServerStatus from './cards/ServerStatus'
import ToDoList from './cards/ToDoList'
import WelcomePanel from './cards/WelcomePanel'

window.AdminComponents = {
    MessagesConsumerMixin   : MessagesConsumerMixin,
    PydioConsumerMixin      : PydioConsumerMixin,
    NavigationHelper        : NavigationHelper,
    MenuItemListener        : MenuItemListener,
    DNDActionsManager       : DNDActionsManager,

    AdminDashboard          : AdminDashboard,
    SimpleDashboard         : SimpleDashboard,
    GroupAdminDashboard     : GroupAdminDashboard,
    Header,
    SubHeader,
    CodeMirrorField,
    TabBoard,

    GraphCard,
    GraphBadge,
    MostActiveBadge,
    QuickLinks,
    RecentLogs,
    ServerStatus,
    ServicesStatus,
    ToDoList,
    WelcomePanel
};