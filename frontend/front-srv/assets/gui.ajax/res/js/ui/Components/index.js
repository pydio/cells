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

import SortableList from './list/SortableList'
import SimpleList from './list/SimpleList'
import NodeListCustomProvider from './list/NodeListCustomProvider'
import {ListEntry} from './list/ListEntry'
import ListPaginator from './list/ListPaginator'
import MaterialTable from './list/MaterialTable'

import {TreeView, DNDTreeView, FoldersTree} from './views/TreeView'

import LabelWithTip from './elements/LabelWithTip'
import SimpleFigureBadge from './elements/SimpleFigureBadge'
import SearchBox from './views/SearchBox'
import ClipboardTextField from './elements/ClipboardTextField'
import EmptyStateView from './views/EmptyStateView'
import ModalAppBar from './views/ModalAppBar'

import ReactEditorOpener from './editor/ReactEditorOpener'
import {PaperEditorLayout, PaperEditorNavEntry, PaperEditorNavHeader} from './editor/PaperEditor'
import DynamicGrid from './dynamic-grid/DynamicGrid'
import Store from './dynamic-grid/Store'
import GridItemMixin from './dynamic-grid/GridItemMixin'
import asGridItem from './dynamic-grid/asGridItem'

import {Types, collect, collectDrop, nodeDragSource, nodeDropTarget, DNDActionParameter} from './util/DND'

import UserAvatar from './users/avatar/UserAvatar'
import UsersCompleter from './users/UsersCompleter'
import TeamCreationForm from './users/TeamCreationForm'

import ButtonMenu from './menu/ButtonMenu'
import ContextMenu from './menu/ContextMenu'
import IconButtonMenu from './menu/IconButtonMenu'
import Toolbar from './menu/Toolbar'

import AddressBook from './users/addressbook/AddressBook'
import ChatClient from './chat/ChatClient'
import Chat from './chat/Chat'
import ChatIcon from './chat/ChatIcon'
import ResourcePoliciesPanel from './policies/ResourcePoliciesPanel'
import CellActionsRenderer from './users/avatar/CellActionsRenderer'

const PydioComponents = {

    SortableList            : SortableList,
    SimpleList              : SimpleList,
    NodeListCustomProvider  : NodeListCustomProvider,
    ListEntry               : ListEntry,
    ListPaginator           : ListPaginator,
    MaterialTable,

    TreeView                : TreeView,
    DNDTreeView             : DNDTreeView,
    FoldersTree             : FoldersTree,
    ClipboardTextField      : ClipboardTextField,
    LabelWithTip            : LabelWithTip,
    EmptyStateView          : EmptyStateView,
    SimpleFigureBadge       : SimpleFigureBadge,
    SearchBox               : SearchBox,
    ModalAppBar             : ModalAppBar,

    ReactEditorOpener       : ReactEditorOpener,
    PaperEditorLayout       : PaperEditorLayout,
    PaperEditorNavEntry     : PaperEditorNavEntry,
    PaperEditorNavHeader    : PaperEditorNavHeader,

    DynamicGrid             : DynamicGrid,
    DynamicGridItemMixin    : GridItemMixin,
    asGridItem              : asGridItem,
    DynamicGridStore        : Store,

    DND                     : {
        Types, collect, collectDrop, nodeDragSource, nodeDropTarget, DNDActionParameter
    },
    DNDActionParameter      : DNDActionParameter,

    UserAvatar              : UserAvatar,
    UsersCompleter          : UsersCompleter,
    TeamCreationForm        : TeamCreationForm,
    AddressBook             : AddressBook,

    ContextMenu             : ContextMenu,
    Toolbar                 : Toolbar,
    ButtonMenu              : ButtonMenu,
    IconButtonMenu          : IconButtonMenu,

    Chat,
    ChatIcon,
    ChatClient,
    ResourcePoliciesPanel,
    CellActionsRenderer
};

export {PydioComponents as default}
