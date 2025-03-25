/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import Pydio from 'pydio'
const { EditorActions } = Pydio.requireLib('hoc');

// Actions definitions
export const onSave = ({tab, dispatch}) => () => {
    return Pydio.getInstance().ApiClient.postPlainTextContent(tab.node, tab.content, (success) => {
        if (success) {
            dispatch(EditorActions.tabModify({id: tab.id, message: Pydio.getMessages()[115]}))
        } else {
            dispatch(EditorActions.tabModify({id: tab.id, message: Pydio.getMessages()[210]}))
        }
    })
};
