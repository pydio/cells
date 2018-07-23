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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var IdmApi = _pydioHttpApi2['default'].getRestClient().getIdmApi();

var Loaders = (function () {
    function Loaders() {
        _classCallCheck(this, Loaders);
    }

    Loaders.childrenAsPromise = function childrenAsPromise(item) {
        var leaf = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var childrenLoader = item.childrenLoader;
        var itemsLoader = item.itemsLoader;
        var leafLoaded = item.leafLoaded;
        var collectionsLoaded = item.collectionsLoaded;
        var leafs = item.leafs;
        var collections = item.collections;

        var loader = leaf ? itemsLoader : childrenLoader;
        var loaded = leaf ? leafLoaded : collectionsLoaded;
        return new Promise(function (resolve, reject) {
            if (!loaded && loader) {
                loader(item, function (newChildren) {
                    if (leaf) {
                        item.leafs = newChildren;
                        item.leafLoaded = true;
                    } else {
                        item.collections = newChildren;
                        item.collectionsLoaded = true;
                    }
                    resolve(newChildren);
                });
            } else {
                var res = (leaf ? leafs : collections) || [];
                resolve(res);
            }
        });
    };

    Loaders.computePagination = function computePagination(result) {
        var count = undefined;
        if (result.Users) {
            count = result.Users.length;
        } else if (result.Groups) {
            count = result.Groups.length;
        } else if (result.Teams) {
            count = result.Teams.length;
        }
        if (result.Total > count) {
            return {
                start: result.Offset,
                end: result.Offset + result.Limit,
                max: result.Total,
                interval: result.Limit
            };
        } else {
            return null;
        }
    };

    Loaders.loadTeams = function loadTeams(entry, callback) {
        var offset = 0,
            limit = 50;
        if (entry.range) {
            var _entry$range$split = entry.range.split('-');

            var start = _entry$range$split[0];
            var end = _entry$range$split[1];

            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        IdmApi.listTeams('', offset, limit).then(function (collection) {
            entry.pagination = Loaders.computePagination(collection);
            var items = collection.Teams.map(function (team) {
                return {
                    _parent: entry,
                    id: team.Uuid,
                    label: team.Label,
                    icon: 'mdi mdi-account-multiple-outline',
                    itemsLoader: Loaders.loadTeamUsers,
                    actions: {
                        type: 'team',
                        remove: '574',
                        multiple: true
                    },
                    _notSelectable: true,
                    IdmRole: team
                };
            });
            callback(items);
        });
    };

    Loaders.loadGroups = function loadGroups(entry, callback) {
        var path = '/',
            filter = '';
        if (entry.IdmUser) {
            path = _pydioUtilLang2['default'].trimRight(entry.IdmUser.GroupPath, '/') + '/' + entry.IdmUser.GroupLabel;
        }
        if (entry.currentParams && entry.currentParams.has_search) {
            filter = entry.currentParams.value;
        }

        IdmApi.listGroups(path, filter, false, 0, 1000).then(function (groups) {
            var items = groups.Groups.map(function (idmUser) {
                return {
                    _parent: entry,
                    id: idmUser.Uuid,
                    label: idmUser.GroupLabel,
                    type: 'group',
                    icon: 'mdi mdi-account-multiple',
                    childrenLoader: entry.childrenLoader ? Loaders.loadGroups : null,
                    itemsLoader: entry.itemsLoader ? Loaders.loadGroupUsers : null,
                    currentParams: entry.currentParams && entry.currentParams.alpha_pages ? _extends({}, entry.currentParams) : {},
                    IdmUser: idmUser
                };
            });
            callback(items);
        });
    };

    Loaders.loadExternalUsers = function loadExternalUsers(entry, callback) {
        var filter = '',
            offset = 0,
            limit = 50;
        if (entry.currentParams && entry.currentParams.alpha_pages) {
            filter = entry.currentParams.value;
        }
        if (entry.range) {
            var _entry$range$split2 = entry.range.split('-');

            var start = _entry$range$split2[0];
            var end = _entry$range$split2[1];

            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        var pydio = _pydioHttpApi2['default'].getClient().getPydioObject();
        IdmApi.listUsers('/', filter, true, offset, limit, 'shared').then(function (users) {
            entry.pagination = Loaders.computePagination(users);
            var items = users.Users.filter(function (idmUser) {
                return idmUser.Login !== pydio.user.id;
            }).map(function (idmUser) {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    avatar: idmUser.Attributes && idmUser.Attributes["avatar"] ? idmUser.Attributes["avatar"] : undefined,
                    type: 'user',
                    external: true,
                    IdmUser: idmUser
                };
            });
            callback(items);
        });
    };

    Loaders.loadGroupUsers = function loadGroupUsers(entry, callback) {
        var path = '/',
            filter = '',
            offset = 0,
            limit = 50;
        if (entry.IdmUser) {
            path = _pydioUtilLang2['default'].trimRight(entry.IdmUser.GroupPath, '/') + '/' + entry.IdmUser.GroupLabel;
        }
        if (entry.currentParams && (entry.currentParams.alpha_pages || entry.currentParams.has_search)) {
            filter = entry.currentParams.value;
        }
        if (entry.range) {
            var _entry$range$split3 = entry.range.split('-');

            var start = _entry$range$split3[0];
            var end = _entry$range$split3[1];

            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        var pydio = _pydioHttpApi2['default'].getClient().getPydioObject();
        IdmApi.listUsers(path, filter, false, offset, limit, '!shared').then(function (users) {
            entry.pagination = Loaders.computePagination(users);
            var items = users.Users.filter(function (idmUser) {
                return idmUser.Login !== pydio.user.id;
            }).map(function (idmUser) {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    avatar: idmUser.Attributes && idmUser.Attributes["avatar"] ? idmUser.Attributes["avatar"] : undefined,
                    type: 'user',
                    IdmUser: idmUser
                };
            });
            callback(items);
        });
    };

    Loaders.loadTeamUsers = function loadTeamUsers(entry, callback) {
        var offset = 0,
            limit = 50;
        if (entry.range) {
            var _entry$range$split4 = entry.range.split('-');

            var start = _entry$range$split4[0];
            var end = _entry$range$split4[1];

            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        IdmApi.listUsersWithRole(entry.IdmRole.Uuid, offset, limit).then(function (users) {
            entry.pagination = Loaders.computePagination(users);
            var items = users.Users.map(function (idmUser) {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    type: 'user',
                    IdmUser: idmUser
                };
            });
            callback(items);
        });
    };

    return Loaders;
})();

exports['default'] = Loaders;
module.exports = exports['default'];
