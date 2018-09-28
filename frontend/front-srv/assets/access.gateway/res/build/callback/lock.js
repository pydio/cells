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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = function (pydio) {
    return function () {
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
        var req = new _pydioHttpRestApi.IdmUpdateUserMetaRequest();
        var node = pydio.getContextHolder().getUniqueNode();
        var meta = new _pydioHttpRestApi.IdmUserMeta();
        meta.NodeUuid = node.getMetadata().get('uuid');
        meta.Namespace = "content_lock";
        meta.JsonValue = pydio.user.id;
        var p = undefined;
        var wasLocked = node.getMetadata().get("sl_locked");
        if (wasLocked) {
            req.Operation = 'DELETE';
        } else {
            req.Operation = 'PUT';
        }
        req.MetaDatas = [meta];
        api.updateUserMeta(req).then(function (res) {
            pydio.getContextHolder().requireNodeReload(node);
        });
    };
};

module.exports = exports['default'];
