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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var DNDActionsManager = (function () {
    function DNDActionsManager() {
        _classCallCheck(this, DNDActionsManager);
    }

    _createClass(DNDActionsManager, null, [{
        key: 'canDropNodeOnNode',

        /**
         * Check if a source can be dropped on a target.
         * Throws an exception if not allowed
         *
         * @param source AjxpNode
         * @param target AjxpNode
         */
        value: function canDropNodeOnNode(source, target) {
            var sourceMime = source.getAjxpMime();
            var targetMime = target.getAjxpMime();
            if (sourceMime === "role" && source.getMetadata().get("role_id") === "PYDIO_GRP_/") {
                throw new Error('Cannot drop this!');
            }
            var result = undefined;
            if (sourceMime === "role" && targetMime === "user_editable") {
                result = true;
            }
            if (sourceMime === "user_editable" && targetMime === "group") {
                result = true;
            }
            if (!result) {
                throw new Error('Cannot drop this!');
            }
        }

        /**
         * Apply a successful drop of Source on Target
         * @param source AjxpNode
         * @param target AjxpNode
         */
    }, {
        key: 'dropNodeOnNode',
        value: function dropNodeOnNode(source, target) {
            var sourceMime = source.getAjxpMime();
            var targetMime = target.getAjxpMime();
            if (sourceMime === "user_editable" && targetMime === "group") {
                if (_pydioUtilPath2['default'].getDirname(source.getPath()) === target.getPath()) {
                    alert('Please drop user in a different group!');
                    return;
                }
                // update_user_group
                var idmUser = source.getMetadata().get('IdmUser');
                var idmGroup = target.getMetadata().get('IdmUser');
                if (!idmGroup && target.getPath() === '/idm/users') {
                    idmUser.GroupPath = '/';
                } else {
                    idmUser.GroupPath = _pydioUtilLang2['default'].trimRight(idmGroup.GroupPath, '/') + '/' + idmGroup.GroupLabel;
                }
                _pydioHttpApi2['default'].getRestClient().getIdmApi().updateIdmUser(idmUser).then(function (res) {
                    if (source.getParent()) {
                        source.getParent().reload();
                    }
                    target.reload();
                });
            } else if (sourceMime === "role" && targetMime === "user_editable") {
                // TODO : Apply role to user
            }
        }
    }]);

    return DNDActionsManager;
})();

exports['default'] = DNDActionsManager;
module.exports = exports['default'];
