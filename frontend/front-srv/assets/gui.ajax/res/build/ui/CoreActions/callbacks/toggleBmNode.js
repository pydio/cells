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

exports.__esModule = true;
exports['default'] = toggleBookmarkNode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globals = require("../globals");

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

function toggleBookmarkNode(node, selection) {

    var isBookmarked = node.getMetadata().get('bookmark') === 'true';
    var nodeUuid = node.getMetadata().get('uuid');
    var userId = _globals.pydio.user.id;

    var api = new _cellsSdk.UserMetaServiceApi(_pydioHttpApi2['default'].getRestClient());
    var request = new _cellsSdk.IdmUpdateUserMetaRequest();
    if (isBookmarked) {
        var searchRequest = new _cellsSdk.IdmSearchUserMetaRequest();
        searchRequest.NodeUuids = [nodeUuid];
        searchRequest.Namespace = "bookmark";
        return api.searchUserMeta(searchRequest).then(function (res) {
            if (res.Metadatas && res.Metadatas.length) {
                request.Operation = _cellsSdk.UpdateUserMetaRequestUserMetaOp.constructFromObject('DELETE');
                request.MetaDatas = res.Metadatas;
                api.updateUserMeta(request).then(function () {
                    if (selection) {
                        selection.requireNodeReload(node);
                    }
                    _globals.pydio.notify("reload-bookmarks");
                });
            }
        });
    } else {
        request.Operation = _cellsSdk.UpdateUserMetaRequestUserMetaOp.constructFromObject('PUT');
        var userMeta = new _cellsSdk.IdmUserMeta();
        userMeta.NodeUuid = nodeUuid;
        userMeta.Namespace = "bookmark";
        userMeta.JsonValue = "\"true\"";
        userMeta.Policies = [_cellsSdk.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'OWNER', Subject: 'user:' + userId, Effect: 'allow' }), _cellsSdk.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'READ', Subject: 'user:' + userId, Effect: 'allow' }), _cellsSdk.ServiceResourcePolicy.constructFromObject({ Resource: nodeUuid, Action: 'WRITE', Subject: 'user:' + userId, Effect: 'allow' })];
        request.MetaDatas = [userMeta];
        return api.updateUserMeta(request).then(function () {
            if (selection) {
                selection.requireNodeReload(node);
            }
            _globals.pydio.notify("reload-bookmarks");
        });
    }
}

module.exports = exports['default'];
