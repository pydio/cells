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
import GridDashboard from './board/GridDashboard'
import SimpleDashboard from './board/SimpleDashboard'

import {MessagesConsumerMixin, PydioConsumerMixin} from './util/Mixins'
import NavigationHelper from './util/NavigationHelper'
import MenuItemListener from './util/MenuItemListener'
import DNDActionsManager from './util/DNDActionsManager'
import CodeMirrorField from './util/CodeMirrorField'
import PluginsLoader from './util/PluginsLoader'

import AdminStyles from './styles/AdminStyles'
import Header from './styles/Header'
import SubHeader from './styles/SubHeader'

import QuickLinks from "./cards/QuickLinks";
import RecentLogs from "./cards/RecentLogs";
import SoftwareUpdate from "./cards/SoftwareUpdate";
import FakeGraph from "./cards/FakeGraph";

import {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} from './styles/PaperEditor'

window.AdminComponents = {
    AdminDashboard,
    SimpleDashboard,
    GridDashboard,

    MessagesConsumerMixin,
    PydioConsumerMixin,
    NavigationHelper,
    MenuItemListener,
    DNDActionsManager,
    PluginsLoader,
    CodeMirrorField,

    AdminStyles,
    Header,
    SubHeader,

    PaperEditorLayout,
    PaperEditorNavEntry,
    PaperEditorNavHeader,

    QuickLinks,
    RecentLogs,
    SoftwareUpdate,
    FakeGraph
};