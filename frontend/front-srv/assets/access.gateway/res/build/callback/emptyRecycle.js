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

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

exports['default'] = function (pydio) {
    var MessageHash = pydio.MessageHash;

    return function () {

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: MessageHash[177],
            dialogTitleId: 220,
            validCallback: function validCallback() {
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                var deleteRequest = new _pydioHttpRestApi.RestDeleteNodesRequest();
                var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2['default'].getRestClient());
                var n = new _pydioHttpRestApi.TreeNode();
                n.Path = slug + '/recycle_bin';
                deleteRequest.Nodes = [n];
                api.deleteNodes(deleteRequest).then(function (r) {
                    if (r.DeleteJobs) {
                        r.DeleteJobs.forEach(function (j) {
                            pydio.UI.displayMessage('SUCCESS', j.Label);
                        });
                    }
                    pydio.getContextHolder().requireContextChange(pydio.getContextHolder().getRootNode());
                })['catch'](function (e) {
                    pydio.UI.displayMessage('ERROR', e.Title || e.message);
                });
            }
        });
    };
};

module.exports = exports['default'];
