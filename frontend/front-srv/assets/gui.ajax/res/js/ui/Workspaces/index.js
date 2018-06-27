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
import { SearchForm } from './search'

import WorkspacesList from './wslist/WorkspacesList'
import WorkspacesListMaterial from './wslist/WorkspacesListMaterial'
import LeftPanel from './leftnav/LeftPanel'
import DynamicLeftPanel from './leftnav/DynamicLeftPanel'
import UserWidget from './leftnav/UserWidget'
import TourGuide from './views/TourGuide'

import InfoPanel from './detailpanes/InfoPanel'
import InfoPanelCard from './detailpanes/InfoPanelCard'
import InfoRootNode from './detailpanes/RootNode'

import GenericInfoCard from './detailpanes/GenericInfoCard'
import FileInfoCard from './detailpanes/FileInfoCard'

import { Editor } from './editor/components/editor'

const classes = {
    OpenNodesModel,
    MainFilesList,
    EditionPanel,
    Breadcrumb,
    SearchForm,
    FilePreview,
    FSTemplate,
    WorkspacesList,
    WorkspacesListMaterial,
    LeftPanel,
    DynamicLeftPanel,
    UserWidget,
    TourGuide,

    InfoPanel,
    InfoPanelCard,
    InfoRootNode,
    FileInfoCard,
    GenericInfoCard,

    Editor
}

export {classes as default}
