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
    var MessageHash = pydio.MessageHash;

    return function () {
        var move = false;
        var message = MessageHash[177];

        var repoHasRecycle = pydio.getContextHolder().getRootNode().getMetadata().get("repo_has_recycle") || pydio.getContextHolder().getRootNode().getChildren().has('/recycle_bin');
        if (repoHasRecycle && pydio.getContextNode().getAjxpMime() !== "ajxp_recycle") {
            message = MessageHash[176];
        }
        // Detect shared node
        if (pydio.getPluginConfigs('action.share').size) {
            (function () {
                var shared = [];
                pydio.getContextHolder().getSelectedNodes().forEach(function (n) {
                    if (n.getMetadata().get('pydio_is_shared')) {
                        shared.push(n);
                    }
                });
                if (shared.length) {
                    var n = shared[0];
                    message = React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'div',
                            null,
                            message
                        ),
                        React.createElement(
                            'div',
                            { style: { color: '#D32F2F', marginTop: 10 } },
                            React.createElement('span', { className: 'mdi mdi-alert' }),
                            MessageHash['share_center.' + (n.isLeaf() ? '158' : '157')]
                        )
                    );
                }
            })();
        }
        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: message,
            dialogTitleId: 7,
            validCallback: function validCallback() {
                var nodes = pydio.getContextHolder().getSelectedNodes();
                var slug = pydio.user.getActiveRepositoryObject().getSlug();
                var deleteRequest = new _pydioHttpRestApi.RestDeleteNodesRequest();
                var api = new _pydioHttpRestApi.TreeServiceApi(_pydioHttpApi2['default'].getRestClient());
                deleteRequest.Nodes = nodes.map(function (n) {
                    var t = new _pydioHttpRestApi.TreeNode();
                    t.Path = slug + n.getPath();
                    return t;
                });
                api.deleteNodes(deleteRequest).then(function (r) {
                    if (r.DeleteJobs) {
                        r.DeleteJobs.forEach(function (j) {
                            pydio.UI.displayMessage('SUCCESS', j.Label);
                        });
                    }
                    pydio.getContextHolder().setSelectedNodes([]);
                });
            }
        });
    };
};

module.exports = exports['default'];
