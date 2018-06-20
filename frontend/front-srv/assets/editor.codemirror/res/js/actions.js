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

import Pydio from 'pydio'
import { parseQuery } from './utils';

const { EditorActions } = Pydio.requireLib('hoc');

// Actions definitions
export const onSave = ({pydio, url, content, dispatch, id}) => {
    return pydio.ApiClient.postPlainTextContent(url, content, (success) => {
        if (!success) {
            dispatch(EditorActions.tabModify({id, error: "There was an error while saving"}))
        }
    })
}

export const onUndo = ({codemirror}) => codemirror.undo()
export const onRedo = ({codemirror}) => codemirror.redo()
export const onToggleLineNumbers = ({dispatch, id, lineNumbers}) => dispatch(EditorActions.tabModify({id, lineNumbers: !lineNumbers}))
export const onToggleLineWrapping = ({dispatch, id, lineWrapping}) => dispatch(EditorActions.tabModify({id, lineWrapping: !lineWrapping}))

export const onSearch = ({codemirror, cursor}) => (value) => {
    const query = parseQuery(value)

    let cur = codemirror.getSearchCursor(query, cursor.to);

    if (!cur.find()) {
        cur = codemirror.getSearchCursor(query, 0);
        if (!cur.find()) return;
    }

    codemirror.setSelection(cur.from(), cur.to());
    codemirror.scrollIntoView({from: cur.from(), to: cur.to()}, 20);
}

export const onJumpTo = ({codemirror}) => (value) => {
    const line = parseInt(value)
    const cur = codemirror.getCursor();

    codemirror.focus();
    codemirror.setCursor(line - 1, cur.ch);
    codemirror.scrollIntoView({line: line - 1, ch: cur.ch}, 20);
}
