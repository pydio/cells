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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var parseString = function parseString(str) {
    return str.replace(/\\(.)/g, function (_, ch) {
        return ch === "n" ? "\n" : ch === "r" ? "\r" : ch;
    });
};

exports.parseString = parseString;
var parseQuery = function parseQuery(query) {

    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
        try {
            query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i");
        } catch (e) {} // Not a regular expression after all, do a string search
    } else {
            query = parseString(query);
        }
    if (typeof query == "string" ? query == "" : query.test("")) query = /x^/;

    return query;
};
exports.parseQuery = parseQuery;
