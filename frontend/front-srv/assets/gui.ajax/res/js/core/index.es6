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

// Backward Compat Table
const
    Connexion = require('./http/Connexion'),
    MetaCacheService = require('./http/MetaCacheService'),
    PydioApi = require('./http/PydioApi'),
    SearchApi = require('./http/SearchApi'),
    ResourcesManager = require('./http/ResourcesManager'),
    Logger = require('./lang/Logger'),
    Observable = require('./lang/Observable'),
    Action = require('./model/Action'),
    AjxpNode = require('./model/AjxpNode'),
    Controller = require('./model/Controller'),
    EmptyNodeProvider = require('./model/EmptyNodeProvider'),
    PydioDataModel = require('./model/PydioDataModel'),
    Registry = require('./model/Registry'),
    RemoteNodeProvider = require('./model/RemoteNodeProvider'),
    MetaNodeProvider = require('./model/MetaNodeProvider'),
    SettingsNodeProvider = require('./model/SettingsNodeProvider'),
    Repository = require('./model/Repository'),
    User = require('./model/User'),
    ContextMenu = require('./model/ContextMenu'),
    CookiesManager = require('./util/CookiesManager'),
    DOMUtils = require('./util/DOMUtils'),
    FuncUtils = require('./util/FuncUtils'),
    HasherUtils = require('./util/HasherUtils'),
    LangUtils = require('./util/LangUtils'),
    PassUtils = require('./util/PassUtils'),
    PathUtils = require('./util/PathUtils'),
    PeriodicalExecuter = require('./util/PeriodicalExecuter'),
    ActivityMonitor = require('./util/ActivityMonitor'),
    XMLUtils = require('./util/XMLUtils'),
    Pydio = require('./Pydio');

import * as UsersApi from './http/PydioUsersApi';
const PydioUsers = {
    Client: UsersApi.UsersApi,
    User  : UsersApi.User
};

const namespace = {
    Connexion,
    MetaCacheService,
    PydioApi,
    PydioUsers,
    ResourcesManager,
    Logger,
    Observable,
    Action,
    AjxpNode,
    Controller,
    EmptyNodeProvider,
    PydioDataModel,
    Registry,
    RemoteNodeProvider,
    MetaNodeProvider,
    SettingsNodeProvider,
    SearchApi,
    Repository,
    User,
    ContextMenu,
    CookiesManager,
    DOMUtils,
    FuncUtils,
    HasherUtils,
    LangUtils,
    PassUtils,
    PathUtils,
    PeriodicalExecuter,
    ActivityMonitor,
    XMLUtils,
    Pydio
};

Object.assign(window, {...namespace, PydioCore: namespace});
