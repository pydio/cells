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

import Pydio from 'pydio';
import * as EditorActions from '../actions'
const { TAB_CREATE, TAB_MODIFY, TAB_ADD_CONTROLS, TAB_DELETE, TAB_DELETE_ALL } = EditorActions;

export default function tabs(state = [], action) {

    switch (action.type) {
        case TAB_CREATE:
            return [
                {
                    id: state.reduce((maxId, tab) => Math.max(tab.id, maxId), -1) + 1,
                    ...action
                },
                ...state
            ]
        case TAB_MODIFY:
            return state.map((tab) => {
                if (tab.id === action.id) {
                    return {
                        ...tab,
                        ...action
                    }
                }

                return tab
            })
        case TAB_ADD_CONTROLS:
            return state.map((tab) => {
                if (tab.id === action.id) {
                    const controls = tab.controls
                    return {
                        ...tab,
                        controls: {
                            ...controls,
                            ...action
                        }
                    }
                }

                return tab
            })
        case TAB_DELETE:
            return state.filter(tab => tab.id !== action.id)
        case TAB_DELETE_ALL:
            return []
        default:
            return state
    }
}
