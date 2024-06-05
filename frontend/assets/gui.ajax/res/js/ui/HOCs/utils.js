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

import * as EditorActions from './editor/actions';

export { EditorActions }

import * as contentActions from './content/actions';
import * as resolutionActions from './resolution/actions';
import * as selectionActions from './selection/actions';
import * as sizeActions from './size/actions';
import * as localisationActions from './localisation/actions';

const defaultActions = {
    ...contentActions,
    ...resolutionActions,
    ...selectionActions,
    ...sizeActions,
    ...localisationActions
}

// Helper functions
const getActions = ({editorData}) => editorData.editorActions && FuncUtils.getFunctionByName(editorData.editorActions, window) || {}

export const handler = (func, {dispatch, tab}) => {
    const fn = getActions(tab)[func]
    return (typeof fn === "function" && fn({dispatch, tab}))
}

export const toTitleCase = str => str.replace(/\w\S*/g, (txt) => `${txt.charAt(0).toUpperCase()}${txt.substr(1)}`)

export const getDisplayName = (Component) => {
    return Component.displayName || Component.name || 'Component';
}

export const getRatio = {
    cover: ({widthRatio, heightRatio}) => Math.max(widthRatio, heightRatio),
    contain: ({widthRatio, heightRatio}) => Math.min(widthRatio, heightRatio),
    auto: ({scale}) => scale
}

export const getBoundingRect = (element) => {

    const style = window.getComputedStyle(element);
    const keys = ["left", "right", "top", "bottom"];

    const margin = keys.reduce((current, key) => ({...current, [key]: parseInt(style[`margin-${key}`]) || 0}), {})
    const padding = keys.reduce((current, key) => ({...current, [key]: parseInt(style[`padding-${key}`]) || 0}), {})
    const border = keys.reduce((current, key) => ({...current, [key]: parseInt(style[`border-${key}`]) || 0}), {})

    const rect = element.getBoundingClientRect();

    const res = {
        left: rect.left - margin.left,
        right: rect.right - margin.right - padding.left - padding.right,
        top: rect.top - margin.top,
        bottom: rect.bottom - margin.bottom - padding.top - padding.bottom - border.bottom
    }

    return {
        ...res,
        width: res.right - res.left,
        height: res.bottom - res.top
    }
}
