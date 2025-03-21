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
import Masonry from './list/Masonry'
import Timeline from './list/Timeline'
import {useDataModelSelection, useDataModelContextNodeAsItems} from './list/hooks'
import {sortNodesNatural, nodesSorterByAttribute} from "./list/sorters";

import {TreeView, DNDTreeView, FoldersTree} from './views/TreeView'

import LabelWithTip from './elements/LabelWithTip'
import SimpleFigureBadge from './elements/SimpleFigureBadge'
import ClipboardTextField from './elements/ClipboardTextField'
import {GenericCard, GenericLine, Mui3CardLine} from './elements/GenericCard'
import QuotaUsageLine from "./elements/QuotaUsageLine";
import EmptyStateView from './views/EmptyStateView'
import ModalAppBar from './views/ModalAppBar'

import ReactEditorOpener from './editor/ReactEditorOpener'
import DynamicGrid from './dynamic-grid/DynamicGrid'
import Store from './dynamic-grid/Store'
import GridItemMixin from './dynamic-grid/GridItemMixin'
import asGridItem from './dynamic-grid/asGridItem'

import {Types, collect, collectDrop, nodeDragSource, nodeDropTarget, DNDActionParameter} from './util/DND'

import UserAvatar from './users/avatar/UserAvatar'
import UsersCompleter from './users/UsersCompleter'
import TeamCreationForm from './users/TeamCreationForm'
import SharedUsersStack from './users/stack/SharedUsersStack'
import SharedAvatar from './users/stack/SharedAvatar'

import ButtonMenu from './menu/ButtonMenu'
import ContextMenu from './menu/ContextMenu'
import IconButtonMenu from './menu/IconButtonMenu'
import Toolbar from './menu/Toolbar'
import MenuItemsConsumer from './menu/MenuItemsConsumer'
import MenuUtils from './menu/Utils'

import AddressBook from './users/addressbook/AddressBook'
import DirectoryLayout from './users/addressbook/DirectoryLayout'
import ListStylesCompact from './users/addressbook/ListStylesCompact'
import ChatClient from './chat/ChatClient'
import Chat from './chat/Chat'
import ChatIcon from './chat/ChatIcon'
import ResourcePoliciesPanel from './policies/ResourcePoliciesPanel'
import CellActionsRenderer from './users/avatar/CellActionsRenderer'

import PanelBigButtons from './stepper/PanelBigButtons'
import Dialog from './stepper/Dialog'

const PydioComponents = {

    SortableList            : SortableList,
    SimpleList              : SimpleList,
    NodeListCustomProvider  : NodeListCustomProvider,
    ListEntry               : ListEntry,
    ListPaginator           : ListPaginator,
    MaterialTable,
    Masonry,
    Timeline,
    useDataModelSelection,
    useDataModelContextNodeAsItems,
    sortNodesNatural,
    nodesSorterByAttribute,

    TreeView                : TreeView,
    DNDTreeView             : DNDTreeView,
    FoldersTree             : FoldersTree,
    ClipboardTextField      : ClipboardTextField,
    LabelWithTip            : LabelWithTip,
    EmptyStateView          : EmptyStateView,
    SimpleFigureBadge       : SimpleFigureBadge,
    ModalAppBar             : ModalAppBar,
    GenericCard,
    GenericLine,
    Mui3CardLine,
    QuotaUsageLine,

    ReactEditorOpener       : ReactEditorOpener,

    DynamicGrid             : DynamicGrid,
    DynamicGridItemMixin    : GridItemMixin,
    asGridItem              : asGridItem,
    DynamicGridStore        : Store,

    DND                     : {
        Types, collect, collectDrop, nodeDragSource, nodeDropTarget, DNDActionParameter
    },
    DNDActionParameter      : DNDActionParameter,

    UserAvatar,
    SharedAvatar,
    UsersCompleter,
    TeamCreationForm,
    AddressBook,
    DirectoryLayout,
    ListStylesCompact,
    SharedUsersStack,

    ContextMenu             : ContextMenu,
    Toolbar                 : Toolbar,
    ButtonMenu              : ButtonMenu,
    IconButtonMenu          : IconButtonMenu,
    MenuItemsConsumer,
    MenuUtils,

    Chat,
    ChatIcon,
    ChatClient,
    ResourcePoliciesPanel,
    CellActionsRenderer,

    Stepper : {PanelBigButtons, Dialog}
};

export {PydioComponents as default}
