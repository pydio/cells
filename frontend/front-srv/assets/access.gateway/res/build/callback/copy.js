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

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {
        // + Handle copy in same folder, move in same folder
        var selection = pydio.getUserSelection();
        var submit = function submit(path) {
            var wsId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            require('./applyCopyOrMove')(pydio)('copy', selection, path, wsId);
        };

        pydio.UI.openComponentInModal('FSActions', 'TreeDialog', {
            isMove: false,
            dialogTitle: MessageHash[159],
            submitValue: submit
        });
    };
};

module.exports = exports['default'];
