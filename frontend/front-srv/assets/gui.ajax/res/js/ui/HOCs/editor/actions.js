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
export const EDITOR_SET_ACTIVE_TAB = 'EDITOR_SET_ACTIVE_TAB'
export const editorSetActiveTab = (activeTabId) => ({
    type: EDITOR_SET_ACTIVE_TAB,
    activeTabId
})

export const EDITOR_MODIFY = 'EDITOR_MODIFY'
export const editorModify = (data) => ({
    type: EDITOR_MODIFY,
    ...data
})

// TABS action
export const TAB_CREATE = 'TAB_CREATE'
export const tabCreate = (data) => ({
    type: TAB_CREATE,
    ...data
})

export const TAB_MODIFY = 'TAB_MODIFY'
export const tabModify = (data) => ({
    type: TAB_MODIFY,
    ...data
})

export const TAB_ADD_CONTROLS = 'TAB_ADD_CONTROLS'
export const tabAddControls = (data) => ({
    type: TAB_ADD_CONTROLS,
    ...data
})

export const TAB_DELETE = 'TAB_DELETE'
export const tabDelete = (id) => ({
    type: TAB_DELETE,
    id
})

export const TAB_DELETE_ALL = 'TAB_DELETE_ALL'
export const tabDeleteAll = () => ({
    type: TAB_DELETE_ALL
})
