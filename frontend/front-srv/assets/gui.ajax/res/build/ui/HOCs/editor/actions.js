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

// EDITOR actions
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var EDITOR_SET_ACTIVE_TAB = 'EDITOR_SET_ACTIVE_TAB';
exports.EDITOR_SET_ACTIVE_TAB = EDITOR_SET_ACTIVE_TAB;
var editorSetActiveTab = function editorSetActiveTab(activeTabId) {
    return {
        type: EDITOR_SET_ACTIVE_TAB,
        activeTabId: activeTabId
    };
};

exports.editorSetActiveTab = editorSetActiveTab;
var EDITOR_MODIFY = 'EDITOR_MODIFY';
exports.EDITOR_MODIFY = EDITOR_MODIFY;
var editorModify = function editorModify(data) {
    return _extends({
        type: EDITOR_MODIFY
    }, data);
};

exports.editorModify = editorModify;
// TABS action
var TAB_CREATE = 'TAB_CREATE';
exports.TAB_CREATE = TAB_CREATE;
var tabCreate = function tabCreate(data) {
    return _extends({
        type: TAB_CREATE
    }, data);
};

exports.tabCreate = tabCreate;
var TAB_MODIFY = 'TAB_MODIFY';
exports.TAB_MODIFY = TAB_MODIFY;
var tabModify = function tabModify(data) {
    return _extends({
        type: TAB_MODIFY
    }, data);
};

exports.tabModify = tabModify;
var TAB_ADD_CONTROLS = 'TAB_ADD_CONTROLS';
exports.TAB_ADD_CONTROLS = TAB_ADD_CONTROLS;
var tabAddControls = function tabAddControls(data) {
    return _extends({
        type: TAB_ADD_CONTROLS
    }, data);
};

exports.tabAddControls = tabAddControls;
var TAB_DELETE = 'TAB_DELETE';
exports.TAB_DELETE = TAB_DELETE;
var tabDelete = function tabDelete(id) {
    return {
        type: TAB_DELETE,
        id: id
    };
};

exports.tabDelete = tabDelete;
var TAB_DELETE_ALL = 'TAB_DELETE_ALL';
exports.TAB_DELETE_ALL = TAB_DELETE_ALL;
var tabDeleteAll = function tabDeleteAll() {
    return {
        type: TAB_DELETE_ALL
    };
};
exports.tabDeleteAll = tabDeleteAll;
