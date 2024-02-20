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
import Connexion from "./http/Connexion";
import * as UsersApi from './http/PydioUsersApi';
import MetaCacheService from "./http/MetaCacheService";
import PydioApi from "./http/PydioApi";
import SearchApi from "./http/SearchApi";
import ResourcesManager from "./http/ResourcesManager";
import Logger from "./lang/Logger";
import Observable from "./lang/Observable";
import Action from "./model/Action";
import AjxpNode from "./model/AjxpNode";
import Controller from "./model/Controller";
import EmptyNodeProvider from "./model/EmptyNodeProvider";
import PydioDataModel from "./model/PydioDataModel";
import Registry from "./model/Registry";
import RemoteNodeProvider from "./model/RemoteNodeProvider";
import MetaNodeProvider from "./model/MetaNodeProvider";
import SettingsNodeProvider from "./model/SettingsNodeProvider";
import Repository from "./model/Repository";
import User from "./model/User";
import ContextMenu from "./model/ContextMenu";
import CookiesManager from "./util/CookiesManager";
import DOMUtils from "./util/DOMUtils";
import FuncUtils from "./util/FuncUtils";
import HasherUtils from "./util/HasherUtils";
import LangUtils from "./util/LangUtils";
import PassUtils from "./util/PassUtils";
import PathUtils from "./util/PathUtils";
import PeriodicalExecuter from "./util/PeriodicalExecuter";
import ActivityMonitor from "./util/ActivityMonitor";
import XMLUtils from "./util/XMLUtils";
import Pydio from "./Pydio";
import CellModel from "./model/CellModel";
import IdmObjectHelper from "./model/IdmObjectHelper";
import PydioWebSocket from "./http/PydioWebSocket";
import Policies from "./http/Policies";
import * as SDK from "cells-sdk";

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

var originalRequire = window.require || require

if(originalRequire) {
    window.require = (libName) => {

        switch (libName){
            case 'pydio/lang/observable':
                return Observable
            case 'pydio/lang/logger':
                return Logger
            case 'pydio/util/lang':
                return LangUtils
            case 'pydio/util/func':
                return FuncUtils
            case 'pydio/util/xml':
                return XMLUtils
            case 'pydio/util/path':
                return PathUtils
            case 'pydio/util/hasher':
                return HasherUtils
            case 'pydio/util/pass':
                return PassUtils
            case 'pydio/util/dom':
                return DOMUtils
            case 'pydio/util/cookies':
                return CookiesManager
            case 'pydio/util/periodical-executer':
                return PeriodicalExecuter
            case 'pydio/util/activity-monitor':
                return ActivityMonitor
            case 'pydio/model/node':
                return AjxpNode
            case 'pydio/model/user':
                return User
            case 'pydio/model/remote-node-provider':
                return RemoteNodeProvider
            case 'pydio/model/empty-node-provider':
                return EmptyNodeProvider
            case 'pydio/model/meta-node-provider':
                return MetaNodeProvider
            case 'pydio/model/repository':
                return Repository
            case 'pydio/model/action':
                return Action
            case 'pydio/model/controller':
                return Controller
            case 'pydio/model/data-model':
                return PydioDataModel
            case 'pydio/model/registry':
                return Registry
            case 'pydio/model/context-menu':
                return ContextMenu
            case 'pydio/model/cell':
                return CellModel
            case 'pydio/model/idm-object-helper':
                return IdmObjectHelper
            case 'pydio/http/connexion':
                return Connexion
            case 'pydio/http/resources-manager':
                return ResourcesManager
            case 'pydio/http/api':
                return PydioApi
            case 'pydio/http/search-api':
                return SearchApi
            case 'pydio/http/users-api':
                return UsersApi
            case 'pydio/http/meta-cache-service':
                return MetaCacheService
            case 'pydio/http/websocket':
                return PydioWebSocket
            case 'pydio/http/policies':
                return Policies
            case 'pydio':
                return Pydio
            case 'cells-sdk':
                return SDK
            default:
                break;
        }

        return originalRequire.apply(this, libName);
    }
}
Object.assign(window, {...namespace, PydioCore: namespace});
