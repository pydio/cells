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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _listSortableList = require('./list/SortableList');

var _listSortableList2 = _interopRequireDefault(_listSortableList);

var _listSimpleList = require('./list/SimpleList');

var _listSimpleList2 = _interopRequireDefault(_listSimpleList);

var _listNodeListCustomProvider = require('./list/NodeListCustomProvider');

var _listNodeListCustomProvider2 = _interopRequireDefault(_listNodeListCustomProvider);

var _listListEntry = require('./list/ListEntry');

var _listListPaginator = require('./list/ListPaginator');

var _listListPaginator2 = _interopRequireDefault(_listListPaginator);

var _listMaterialTable = require('./list/MaterialTable');

var _listMaterialTable2 = _interopRequireDefault(_listMaterialTable);

var _viewsTreeView = require('./views/TreeView');

var _elementsLabelWithTip = require('./elements/LabelWithTip');

var _elementsLabelWithTip2 = _interopRequireDefault(_elementsLabelWithTip);

var _elementsSimpleFigureBadge = require('./elements/SimpleFigureBadge');

var _elementsSimpleFigureBadge2 = _interopRequireDefault(_elementsSimpleFigureBadge);

var _elementsClipboardTextField = require('./elements/ClipboardTextField');

var _elementsClipboardTextField2 = _interopRequireDefault(_elementsClipboardTextField);

var _viewsEmptyStateView = require('./views/EmptyStateView');

var _viewsEmptyStateView2 = _interopRequireDefault(_viewsEmptyStateView);

var _viewsModalAppBar = require('./views/ModalAppBar');

var _viewsModalAppBar2 = _interopRequireDefault(_viewsModalAppBar);

var _editorReactEditorOpener = require('./editor/ReactEditorOpener');

var _editorReactEditorOpener2 = _interopRequireDefault(_editorReactEditorOpener);

var _editorPaperEditor = require('./editor/PaperEditor');

var _dynamicGridDynamicGrid = require('./dynamic-grid/DynamicGrid');

var _dynamicGridDynamicGrid2 = _interopRequireDefault(_dynamicGridDynamicGrid);

var _dynamicGridStore = require('./dynamic-grid/Store');

var _dynamicGridStore2 = _interopRequireDefault(_dynamicGridStore);

var _dynamicGridGridItemMixin = require('./dynamic-grid/GridItemMixin');

var _dynamicGridGridItemMixin2 = _interopRequireDefault(_dynamicGridGridItemMixin);

var _dynamicGridAsGridItem = require('./dynamic-grid/asGridItem');

var _dynamicGridAsGridItem2 = _interopRequireDefault(_dynamicGridAsGridItem);

var _utilDND = require('./util/DND');

var _usersAvatarUserAvatar = require('./users/avatar/UserAvatar');

var _usersAvatarUserAvatar2 = _interopRequireDefault(_usersAvatarUserAvatar);

var _usersUsersCompleter = require('./users/UsersCompleter');

var _usersUsersCompleter2 = _interopRequireDefault(_usersUsersCompleter);

var _usersTeamCreationForm = require('./users/TeamCreationForm');

var _usersTeamCreationForm2 = _interopRequireDefault(_usersTeamCreationForm);

var _menuButtonMenu = require('./menu/ButtonMenu');

var _menuButtonMenu2 = _interopRequireDefault(_menuButtonMenu);

var _menuContextMenu = require('./menu/ContextMenu');

var _menuContextMenu2 = _interopRequireDefault(_menuContextMenu);

var _menuIconButtonMenu = require('./menu/IconButtonMenu');

var _menuIconButtonMenu2 = _interopRequireDefault(_menuIconButtonMenu);

var _menuToolbar = require('./menu/Toolbar');

var _menuToolbar2 = _interopRequireDefault(_menuToolbar);

var _menuMenuItemsConsumer = require('./menu/MenuItemsConsumer');

var _menuMenuItemsConsumer2 = _interopRequireDefault(_menuMenuItemsConsumer);

var _menuUtils = require('./menu/Utils');

var _menuUtils2 = _interopRequireDefault(_menuUtils);

var _usersAddressbookAddressBook = require('./users/addressbook/AddressBook');

var _usersAddressbookAddressBook2 = _interopRequireDefault(_usersAddressbookAddressBook);

var _chatChatClient = require('./chat/ChatClient');

var _chatChatClient2 = _interopRequireDefault(_chatChatClient);

var _chatChat = require('./chat/Chat');

var _chatChat2 = _interopRequireDefault(_chatChat);

var _chatChatIcon = require('./chat/ChatIcon');

var _chatChatIcon2 = _interopRequireDefault(_chatChatIcon);

var _policiesResourcePoliciesPanel = require('./policies/ResourcePoliciesPanel');

var _policiesResourcePoliciesPanel2 = _interopRequireDefault(_policiesResourcePoliciesPanel);

var _usersAvatarCellActionsRenderer = require('./users/avatar/CellActionsRenderer');

var _usersAvatarCellActionsRenderer2 = _interopRequireDefault(_usersAvatarCellActionsRenderer);

var PydioComponents = {

    SortableList: _listSortableList2['default'],
    SimpleList: _listSimpleList2['default'],
    NodeListCustomProvider: _listNodeListCustomProvider2['default'],
    ListEntry: _listListEntry.ListEntry,
    ListPaginator: _listListPaginator2['default'],
    MaterialTable: _listMaterialTable2['default'],

    TreeView: _viewsTreeView.TreeView,
    DNDTreeView: _viewsTreeView.DNDTreeView,
    FoldersTree: _viewsTreeView.FoldersTree,
    ClipboardTextField: _elementsClipboardTextField2['default'],
    LabelWithTip: _elementsLabelWithTip2['default'],
    EmptyStateView: _viewsEmptyStateView2['default'],
    SimpleFigureBadge: _elementsSimpleFigureBadge2['default'],
    ModalAppBar: _viewsModalAppBar2['default'],

    ReactEditorOpener: _editorReactEditorOpener2['default'],
    PaperEditorLayout: _editorPaperEditor.PaperEditorLayout,
    PaperEditorNavEntry: _editorPaperEditor.PaperEditorNavEntry,
    PaperEditorNavHeader: _editorPaperEditor.PaperEditorNavHeader,

    DynamicGrid: _dynamicGridDynamicGrid2['default'],
    DynamicGridItemMixin: _dynamicGridGridItemMixin2['default'],
    asGridItem: _dynamicGridAsGridItem2['default'],
    DynamicGridStore: _dynamicGridStore2['default'],

    DND: {
        Types: _utilDND.Types, collect: _utilDND.collect, collectDrop: _utilDND.collectDrop, nodeDragSource: _utilDND.nodeDragSource, nodeDropTarget: _utilDND.nodeDropTarget, DNDActionParameter: _utilDND.DNDActionParameter
    },
    DNDActionParameter: _utilDND.DNDActionParameter,

    UserAvatar: _usersAvatarUserAvatar2['default'],
    UsersCompleter: _usersUsersCompleter2['default'],
    TeamCreationForm: _usersTeamCreationForm2['default'],
    AddressBook: _usersAddressbookAddressBook2['default'],

    ContextMenu: _menuContextMenu2['default'],
    Toolbar: _menuToolbar2['default'],
    ButtonMenu: _menuButtonMenu2['default'],
    IconButtonMenu: _menuIconButtonMenu2['default'],
    MenuItemsConsumer: _menuMenuItemsConsumer2['default'], MenuUtils: _menuUtils2['default'],

    Chat: _chatChat2['default'],
    ChatIcon: _chatChatIcon2['default'],
    ChatClient: _chatChatClient2['default'],
    ResourcePoliciesPanel: _policiesResourcePoliciesPanel2['default'],
    CellActionsRenderer: _usersAvatarCellActionsRenderer2['default']
};

exports['default'] = PydioComponents;
module.exports = exports['default'];
