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

import switchLanguage from './callbacks/switchLanguage'
import changePass from './callbacks/changePass'
import toggleBookmark from './callbacks/toggleBookmark'
import toggleBookmarkNode from './callbacks/toggleBmNode'
import activateDesktopNotifications from './callbacks/activateDesktopNotifications'

import splash from './navigation/splash'
import up from './navigation/up'
import refresh from './navigation/refresh'
import externalSelection from './navigation/externalSelection'
import openGoPro from './navigation/openGoPro'
import switchToSettings from './navigation/switchToSettings'
import switchToHomepage from './navigation/switchToHomepage'
import switchToFilesDefault from './navigation/switchToFilesDefault'

const Callbacks = {
    switchLanguage,
    changePass,
    toggleBookmark,
    toggleBookmarkNode,
    activateDesktopNotifications,
};

const Navigation = {
    splash,
    up,
    refresh,
    externalSelection,
    openGoPro,
    switchToSettings,
    switchToHomepage,
    switchToFilesDefault,
};

import SplashDialog from './dialog/SplashDialog'
import PasswordDialog from './dialog/PasswordDialog'
import BookmarkButton from './callbacks/BookmarkButton'
import MaskWsButton from "./callbacks/MaskWsButton";

export {Callbacks, Navigation, SplashDialog, PasswordDialog, BookmarkButton, MaskWsButton}