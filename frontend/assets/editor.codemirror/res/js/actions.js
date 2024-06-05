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
export const onSave = ({dispatch, tab}) => () => {
    return pydio.ApiClient.postPlainTextContent(tab.node, tab.content, (success) => {
        if (!success) {
            dispatch(EditorActions.tabModify({id: tab.id, message: Pydio.getMessages()[210]}))
        } else {
            dispatch(EditorActions.tabModify({id: tab.id, message: Pydio.getMessages()[115]}))
        }
    })
}

export const onUndo = ({tab}) => () => tab.codemirror.undo()
export const onRedo = ({tab}) => () => tab.codemirror.redo()
export const onToggleLineNumbers = ({dispatch, tab}) => () => dispatch(EditorActions.tabModify({id: tab.id, lineNumbers: !tab.lineNumbers}))
export const onToggleLineWrapping = ({dispatch, tab}) => () => dispatch(EditorActions.tabModify({id: tab.id, lineWrapping: !tab.lineWrapping}))

export const onSearch = ({tab}) => (value) => {
    const {codemirror, cursor} = tab

    const query = parseQuery(value)

    let cur = codemirror.getSearchCursor(query, cursor.to);

    if (!cur.find()) {
        cur = codemirror.getSearchCursor(query, 0);
        if (!cur.find()) return;
    }

    codemirror.setSelection(cur.from(), cur.to());
    codemirror.scrollIntoView({from: cur.from(), to: cur.to()}, 20);
}

export const onJumpTo = ({tab}) => (value) => {
    const {codemirror} = tab

    const line = parseInt(value)
    const cur = codemirror.getCursor();

    codemirror.focus();
    codemirror.setCursor(line - 1, cur.ch);
    codemirror.scrollIntoView({line: line - 1, ch: cur.ch}, 20);
}
