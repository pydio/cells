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

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

exports['default'] = function (pydio) {

    return function () {
        var _callback = function _callback(node, newValue) {
            if (!node) {
                node = pydio.getUserSelection().getUniqueNode();
            }
            if (newValue.indexOf('/') !== -1) {
                throw new Error(pydio.MessageHash['filename.forbidden.slash']);
            }
            var slug = pydio.user.getActiveRepositoryObject().getSlug();
            var path = slug + node.getPath();
            var target = _pydioUtilPath2['default'].getDirname(path) + '/' + newValue;
            var jobParams = {
                nodes: [path],
                target: target,
                targetParent: false
            };
            _pydioHttpApi2['default'].getRestClient().userJob('move', jobParams).then(function (r) {
                var m = pydio.MessageHash['rename.processing'].replace('%1', node.getLabel()).replace('%2', newValue);
                pydio.UI.displayMessage('SUCCESS', m);
                pydio.getContextHolder().setSelectedNodes([]);
            });
        };
        var n = pydio.getUserSelection().getSelectedNodes()[0];
        if (n) {
            var res = n.notify("node_action", { type: "prompt-rename", callback: function callback(value) {
                    _callback(n, value);
                } });
            if ((!res || res[0] !== true) && n.getParent()) {
                n.getParent().notify("child_node_action", { type: "prompt-rename", child: n, callback: function callback(value) {
                        _callback(n, value);
                    } });
            }
        }
    };
};

module.exports = exports['default'];
