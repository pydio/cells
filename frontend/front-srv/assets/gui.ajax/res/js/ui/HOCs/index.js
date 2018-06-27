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

import withContextMenu from './context-menu'
import {withMenu, withControls} from './controls'
import withErrors from './errors'
import withLoader from './loader'
import {ContentActions, ContentControls, ContentSearchControls} from './content/index'
import {SelectionProviders, SelectionActions, SelectionControls, withSelection} from './selection/index'
import {SizeActions, SizeControls, SizeProviders, withResize} from './size/index'
import {ResolutionActions, ResolutionControls, withResolution} from './resolution/index'
import {LocalisationActions, LocalisationControls} from './localisation/index'
import {URLProvider} from './urls'
import PaletteModifier from './PaletteModifier'
import * as Animations from "./animations";
import reducers from './editor/reducers/index'
import * as actions from './editor/actions';
import withVerticalScroll from './scrollbar/withVerticalScroll';
import dropProvider from './drop/dropProvider'
import NativeFileDropProvider from './drop/NativeFileDropProvider'

const PydioHOCs = {
    EditorActions: actions,
    EditorReducers: reducers,
    ContentActions,
    ContentControls,
    ContentSearchControls,
    ResolutionActions,
    ResolutionControls,
    SizeActions,
    SizeControls,
    SelectionProviders,
    SelectionActions,
    SelectionControls,
    LocalisationActions,
    LocalisationControls,
    withControls,
    withContextMenu,
    withErrors,
    withLoader,
    withMenu,
    withResize,
    withResolution,
    withSelection,
    withVerticalScroll,
    dropProvider,
    NativeFileDropProvider,
    Animations,
    PaletteModifier,
    URLProvider,
    SizeProviders
};

export {PydioHOCs as default}
