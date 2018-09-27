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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _contextMenu = require('./context-menu');

var _contextMenu2 = _interopRequireDefault(_contextMenu);

var _controls = require('./controls');

var controls = _interopRequireWildcard(_controls);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

var _contentIndex = require('./content/index');

var _selectionIndex = require('./selection/index');

var _sizeIndex = require('./size/index');

var _resolutionIndex = require('./resolution/index');

var _localisationIndex = require('./localisation/index');

var _urls = require('./urls');

var _PaletteModifier = require('./PaletteModifier');

var _PaletteModifier2 = _interopRequireDefault(_PaletteModifier);

var _animations = require("./animations");

var Animations = _interopRequireWildcard(_animations);

var _editorReducersIndex = require('./editor/reducers/index');

var _editorReducersIndex2 = _interopRequireDefault(_editorReducersIndex);

var _editorActions = require('./editor/actions');

var actions = _interopRequireWildcard(_editorActions);

var _scrollbarWithVerticalScroll = require('./scrollbar/withVerticalScroll');

var _scrollbarWithVerticalScroll2 = _interopRequireDefault(_scrollbarWithVerticalScroll);

var _dropDropProvider = require('./drop/dropProvider');

var _dropDropProvider2 = _interopRequireDefault(_dropDropProvider);

var _dropNativeFileDropProvider = require('./drop/NativeFileDropProvider');

var _dropNativeFileDropProvider2 = _interopRequireDefault(_dropNativeFileDropProvider);

var PydioHOCs = _extends({
    EditorActions: actions,
    EditorReducers: _editorReducersIndex2['default'],
    ContentActions: _contentIndex.ContentActions
}, _contentIndex.Controls, {
    ResolutionActions: _resolutionIndex.ResolutionActions,
    ResolutionControls: _resolutionIndex.ResolutionControls,
    SizeActions: _sizeIndex.SizeActions,
    SizeControls: _sizeIndex.SizeControls,
    SelectionActions: _selectionIndex.SelectionActions,
    SelectionControls: _selectionIndex.SelectionControls,
    LocalisationActions: _localisationIndex.LocalisationActions,
    LocalisationControls: _localisationIndex.LocalisationControls,
    withContextMenu: _contextMenu2['default'],
    withErrors: _errors2['default'],
    withLoader: _loader2['default'],
    withContainerSize: _sizeIndex.withContainerSize,
    withResize: _sizeIndex.withResize,
    withSizeControls: _sizeIndex.withSizeControls,
    withResolution: _resolutionIndex.withResolution,
    withResolutionControls: _resolutionIndex.withResolutionControls,
    withAutoPlayControls: _selectionIndex.withAutoPlayControls,
    withSelectionControls: _selectionIndex.withSelectionControls,
    withSelection: _selectionIndex.withSelection,
    withVerticalScroll: _scrollbarWithVerticalScroll2['default'],
    dropProvider: _dropDropProvider2['default'],
    NativeFileDropProvider: _dropNativeFileDropProvider2['default']
}, Animations, {
    PaletteModifier: _PaletteModifier2['default'],
    URLProvider: _urls.URLProvider,
    SizeProviders: _sizeIndex.SizeProviders
}, controls);

exports['default'] = PydioHOCs;
module.exports = exports['default'];
