/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

function loadEditorClass(className, defaultComponent) {
    if (className === undefined) className = '';

    if (!className) {
        return Promise.resolve(defaultComponent);
    }
    var parts = className.split(".");
    var ns = parts.shift();
    var rest = parts.join('.');
    return _pydioHttpResourcesManager2['default'].loadClass(ns).then(function (c) {
        var comp = _pydioUtilFunc2['default'].getFunctionByName(rest, c);
        if (!comp) {
            console.error('Cannot find editor component, using default instead', className);
            return defaultComponent;
        }
        return comp;
    })['catch'](function (e) {
        console.error('Cannot find editor component, using default instead', className);
        return defaultComponent;
    });
}

exports.loadEditorClass = loadEditorClass;
