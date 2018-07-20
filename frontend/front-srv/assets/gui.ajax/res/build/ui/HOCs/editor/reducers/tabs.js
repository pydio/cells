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

exports['default'] = tabs;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _actions = require('../actions');

var EditorActions = _interopRequireWildcard(_actions);

var TAB_CREATE = EditorActions.TAB_CREATE;
var TAB_MODIFY = EditorActions.TAB_MODIFY;
var TAB_ADD_CONTROLS = EditorActions.TAB_ADD_CONTROLS;
var TAB_DELETE = EditorActions.TAB_DELETE;
var TAB_DELETE_ALL = EditorActions.TAB_DELETE_ALL;

function tabs(state, action) {
    if (state === undefined) state = [];

    switch (action.type) {
        case TAB_CREATE:
            return [_extends({
                id: state.reduce(function (maxId, tab) {
                    return Math.max(tab.id, maxId);
                }, -1) + 1
            }, action)].concat(state);
        case TAB_MODIFY:
            return state.map(function (tab) {
                if (tab.id === action.id) {
                    return _extends({}, tab, action);
                }

                return tab;
            });
        case TAB_ADD_CONTROLS:
            return state.map(function (tab) {
                if (tab.id === action.id) {
                    var controls = tab.controls;
                    return _extends({}, tab, {
                        controls: _extends({}, controls, action)
                    });
                }

                return tab;
            });
        case TAB_DELETE:
            return state.filter(function (tab) {
                return tab.id !== action.id;
            });
        case TAB_DELETE_ALL:
            return [];
        default:
            return state;
    }
}

module.exports = exports['default'];
