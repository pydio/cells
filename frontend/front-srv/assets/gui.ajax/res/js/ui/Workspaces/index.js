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

import OpenNodesModel from './OpenNodesModel'
import MainFilesList from './views/MainFilesList'
import Breadcrumb from './views/Breadcrumb'
import FilePreview from './views/FilePreview'
import FSTemplate from './views/FSTemplate'
import EditionPanel from './views/EditionPanel'
import UnifiedSearchForm from "./search/components/UnifiedSearchForm";
import Renderer from "./search/components/Renderer";
import AdvancedChips from "./search/components/AdvancedChips"
import Facets from './search/components/Facets'
import SearchSorter from './search/components/SearchSorter'

import WorkspacesList from './wslist/WorkspacesList'
import WorkspacesListMaterial from './wslist/WorkspacesListMaterial'
import WorkspacePickerDialog from './wslist/WorkspacePickerDialog'
import LeftPanel from './leftnav/LeftPanel'
import UserWidget from './leftnav/UserWidget'
import TourGuide from './views/TourGuide'
import MasterLayout from './views/MasterLayout'

import InfoPanel from './detailpanes/InfoPanel'
import InfoPanelCard from './detailpanes/InfoPanelCard'
import {MultiColumnContext} from './detailpanes/MultiColumnPanel'

import GenericInfoCard from './detailpanes/GenericInfoCard'
import FileInfoCard from './detailpanes/FileInfoCard'
import {CellChatInfoCard} from './views/CellChat'

import {Editor} from './editor/components/editor'

import {MUITour, WelcomeMUITour, ThemeTogglerCard} from './views/WelcomeMuiTour'
import {Scheme} from './views/WelcomeTour'

const classes = {
    OpenNodesModel,
    MainFilesList,
    EditionPanel,
    Breadcrumb,
    UnifiedSearchForm,
    AdvancedChips,
    FilePreview,
    FSTemplate,
    WorkspacesList,
    WorkspacesListMaterial,
    WorkspacePickerDialog,
    LeftPanel,
    UserWidget,
    TourGuide,
    MasterLayout,
    MetaRenderer:Renderer,
    Facets,
    SearchSorter,

    InfoPanel,
    InfoPanelCard,
    FileInfoCard,
    GenericInfoCard,
    CellChatInfoCard,
    MultiColumnContext,

    MUITour,
    WelcomeMUITour,
    ThemeTogglerCard,
    Scheme,

    Editor
}

export {classes as default}
