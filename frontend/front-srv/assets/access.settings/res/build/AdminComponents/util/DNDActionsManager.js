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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DNDActionsManager = (function () {
    function DNDActionsManager() {
        _classCallCheck(this, DNDActionsManager);
    }

    _createClass(DNDActionsManager, null, [{
        key: "canDropNodeOnNode",

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
            if (sourceMime == "role" && source.getMetadata().get("role_id") == "PYDIO_GRP_/") {
                throw new Error('Cannot drop this!');
            }
            var result;
            if (sourceMime == "role" && targetMime == "user_editable") {
                result = true;
            }
            if (sourceMime == "user_editable" && (targetMime == "group" || targetMime == "users_zone")) {
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
        key: "dropNodeOnNode",
        value: function dropNodeOnNode(source, target) {
            //global.alert('Dropped ' + source.getPath() + ' on ' + target.getPath());
            var sourceMime = source.getAjxpMime();
            var targetMime = target.getAjxpMime();
            if (sourceMime == "user_editable" && (targetMime == "group" || targetMime == "users_zone")) {
                if (PathUtils.getDirname(source.getPath()) == target.getPath()) {
                    global.alert('Please drop user in a different group!');
                    return;
                }
                // update_user_group

                PydioApi.getClient().request({
                    get_action: 'user_update_group',
                    file: source.getPath().substr("/idm/users".length),
                    group_path: targetMime == "users_zone" ? "/" : target.getPath().substr("/idm/users".length)
                }, function () {
                    if (source.getParent()) {
                        source.getParent().reload();
                    }
                    target.reload();
                });
            } else if (sourceMime == "role" && targetMime == "user_editable") {
                PydioApi.getClient().request({
                    get_action: 'edit',
                    sub_action: 'user_add_role',
                    user_id: PathUtils.getBasename(target.getPath()),
                    role_id: PathUtils.getBasename(source.getPath())
                }, function () {
                    if (target.getParent()) {
                        target.getParent().reload();
                    }
                });
            }
        }
    }]);

    return DNDActionsManager;
})();

exports["default"] = DNDActionsManager;
module.exports = exports["default"];
