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

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _utils = require('./utils');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

// Actions definitions
var onSave = function onSave(_ref) {
    var dispatch = _ref.dispatch;
    var tab = _ref.tab;
    return function () {
        return pydio.ApiClient.postPlainTextContent(tab.url, tab.content, function (success) {
            if (!success) {
                dispatch(EditorActions.tabModify({ id: tab.id, message: "There was an error while saving" }));
            } else {
                dispatch(EditorActions.tabModify({ id: tab.id, message: "Successfully saved file" }));
            }
        });
    };
};

exports.onSave = onSave;
var onUndo = function onUndo(_ref2) {
    var tab = _ref2.tab;
    return function () {
        return tab.codemirror.undo();
    };
};
exports.onUndo = onUndo;
var onRedo = function onRedo(_ref3) {
    var tab = _ref3.tab;
    return function () {
        return tab.codemirror.redo();
    };
};
exports.onRedo = onRedo;
var onToggleLineNumbers = function onToggleLineNumbers(_ref4) {
    var dispatch = _ref4.dispatch;
    var tab = _ref4.tab;
    return function () {
        return dispatch(EditorActions.tabModify({ id: tab.id, lineNumbers: !tab.lineNumbers }));
    };
};
exports.onToggleLineNumbers = onToggleLineNumbers;
var onToggleLineWrapping = function onToggleLineWrapping(_ref5) {
    var dispatch = _ref5.dispatch;
    var tab = _ref5.tab;
    return function () {
        return dispatch(EditorActions.tabModify({ id: tab.id, lineWrapping: !tab.lineWrapping }));
    };
};

exports.onToggleLineWrapping = onToggleLineWrapping;
var onSearch = function onSearch(_ref6) {
    var tab = _ref6.tab;
    return function (value) {
        var codemirror = tab.codemirror;
        var cursor = tab.cursor;

        var query = (0, _utils.parseQuery)(value);

        var cur = codemirror.getSearchCursor(query, cursor.to);

        if (!cur.find()) {
            cur = codemirror.getSearchCursor(query, 0);
            if (!cur.find()) return;
        }

        codemirror.setSelection(cur.from(), cur.to());
        codemirror.scrollIntoView({ from: cur.from(), to: cur.to() }, 20);
    };
};

exports.onSearch = onSearch;
var onJumpTo = function onJumpTo(_ref7) {
    var tab = _ref7.tab;
    return function (value) {
        var codemirror = tab.codemirror;

        var line = parseInt(value);
        var cur = codemirror.getCursor();

        codemirror.focus();
        codemirror.setCursor(line - 1, cur.ch);
        codemirror.scrollIntoView({ line: line - 1, ch: cur.ch }, 20);
    };
};
exports.onJumpTo = onJumpTo;
