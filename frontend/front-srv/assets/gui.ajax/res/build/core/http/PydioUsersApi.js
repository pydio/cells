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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _PydioApi = require('./PydioApi');

var _PydioApi2 = _interopRequireDefault(_PydioApi);

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _MetaCacheService = require('./MetaCacheService');

var _MetaCacheService2 = _interopRequireDefault(_MetaCacheService);

var _cellsSdk = require('cells-sdk');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _md5 = require('md5');

var _md52 = _interopRequireDefault(_md5);

var User = (function (_Observable) {
    _inherits(User, _Observable);

    function User(id) {
        var label = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var type = arguments.length <= 2 || arguments[2] === undefined ? 'user' : arguments[2];
        var group = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
        var avatar = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
        var temporary = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];
        var external = arguments.length <= 6 || arguments[6] === undefined ? false : arguments[6];
        var extendedLabel = arguments.length <= 7 || arguments[7] === undefined ? null : arguments[7];

        _classCallCheck(this, User);

        _Observable.call(this);
        this._id = id;
        this._label = label;
        this._type = type;
        if (this._type === 'group') {
            this._group = id;
        }
        this._avatar = avatar;
        this._temporary = temporary;
        this._external = external;
        this._extendedLabel = extendedLabel;
    }

    /**
     *
     * @param idmUser {IdmUser}
     */

    User.prototype.setIdmUser = function setIdmUser(idmUser) {
        this.IdmUser = idmUser;
        this._uuid = idmUser.Uuid;

        var attributes = idmUser.Attributes || {};
        this._label = attributes['displayName'] || idmUser.Login;
        this._type = 'user';
        this._group = '';
        this._avatar = attributes['avatar'];
        this._temporary = false;
        this._external = attributes['profile'] === 'shared';
        this._public = attributes['hidden'] === 'true';
    };

    /**
     * @param idmUser {IdmUser}
     * @return {User}
     */

    User.fromIdmUser = function fromIdmUser(idmUser) {
        var u = new User(idmUser.Login);
        u.setIdmUser(idmUser);
        return u;
    };

    User.fromObject = function fromObject(user) {
        var u = new User(user.id, user.label, user.type, user.group, user.avatar, user.temporary, user.external);
        if (user.uuid) {
            u._uuid = user.uuid;
        }
        return u;
    };

    User.prototype.asObject = function asObject() {
        return {
            id: this._id,
            uuid: this._uuid,
            label: this._label,
            type: this._type,
            group: this._group,
            avatar: this._avatar,
            temporary: this._temporary,
            external: this._external,
            extendedLabel: this._extendedLabel
        };
    };

    User.prototype.getUuid = function getUuid() {
        return this._uuid;
    };

    User.prototype.getId = function getId() {
        return this._id;
    };

    User.prototype.getLabel = function getLabel() {
        return this._label;
    };

    User.prototype.setLabel = function setLabel(label) {
        this._label = label;
    };

    User.prototype.getGraph = function getGraph() {
        return this._graph;
    };

    User.prototype.setGraph = function setGraph(graph) {
        this._graph = graph;
    };

    User.prototype.getType = function getType() {
        return this._type;
    };

    User.prototype.getGroup = function getGroup() {
        return this._group;
    };

    User.prototype.getAvatar = function getAvatar() {
        return this._avatar;
    };

    User.prototype.setAvatar = function setAvatar(avatar) {
        this._avatar = avatar;
    };

    User.prototype.getTemporary = function getTemporary() {
        return this._temporary;
    };

    User.prototype.getExternal = function getExternal() {
        return this._external;
    };

    User.prototype.getExtendedLabel = function getExtendedLabel() {
        return this._extendedLabel;
    };

    User.prototype.isLoading = function isLoading() {
        return this._loading;
    };

    User.prototype.setLoaded = function setLoaded() {
        this._loading = false;
        this.notify('loaded');
    };

    User.prototype.setLoading = function setLoading() {
        this._loading = true;
    };

    User.prototype.setLocal = function setLocal() {
        this._local = true;
    };

    User.prototype.isLocal = function isLocal() {
        return this._local;
    };

    User.prototype.setNotFound = function setNotFound() {
        this._notFound = true;
    };

    User.prototype.isNotFound = function isNotFound() {
        return this._notFound;
    };

    User.prototype.isPublic = function isPublic() {
        return this._public;
    };

    return User;
})(_langObservable2['default']);

var UsersApi = (function () {
    function UsersApi() {
        _classCallCheck(this, UsersApi);
    }

    /**
     *
     * @return {boolean}
     */

    UsersApi.saveSelectionSupported = function saveSelectionSupported() {
        var pydio = _PydioApi2['default'].getClient().getPydioObject();
        if (pydio) {
            return pydio.getController().actions.get('user_team_create') !== undefined;
        } else {
            return false;
        }
    };

    /**
     *
     * @param userObject {User}
     * @param callback Function
     * @param errorCallback Function
     */

    UsersApi.loadPublicData = function loadPublicData(userObject, callback, errorCallback) {

        var userId = userObject.getId();
        userObject.setLabel(userId);
        if (userObject.IdmUser) {
            if (userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["avatar"]) {
                userObject.setAvatar(UsersApi.buildUserAvatarUrl(userId, userObject.IdmUser.Attributes["avatar"]));
            } else {
                UsersApi.avatarFromExternalProvider(userObject, callback);
            }
            if (userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["displayName"]) {
                userObject.setLabel(userObject.IdmUser.Attributes["displayName"]);
            }
            callback(userObject);
        } else {
            _PydioApi2['default'].getRestClient().getIdmApi().loadUser(userId).then(function (user) {
                if (!user) {
                    errorCallback(new Error('Cannot find user'));
                    return;
                }
                userObject.setIdmUser(user);
                if (userObject.getAvatar() && userObject.getAvatar()) {
                    userObject.setAvatar(UsersApi.buildUserAvatarUrl(userId, userObject.getAvatar()));
                } else {
                    UsersApi.avatarFromExternalProvider(userObject, callback);
                }
                callback(userObject);
            })['catch'](function (e) {
                errorCallback(e);
            });
        }
    };

    UsersApi.loadLocalData = function loadLocalData(userObject, callback) {

        var pydio = _PydioApi2['default'].getClient().getPydioObject();
        if (!pydio || !pydio.user) {
            callback(userObject);
            return;
        }
        userObject.setLocal(true);
        var userName = pydio.user.getPreference('displayName') || pydio.user.id;
        userObject.setLabel(userName);

        var avatarUrl = UsersApi.buildUserAvatarUrl(pydio.user.id, pydio.user.getPreference('avatar'));
        if (avatarUrl) {
            userObject.setAvatar(avatarUrl + '?' + pydio.user.getPreference('avatar'));
            callback(userObject);
        } else if (pydio.user.preferences.has('external_avatar_loaded')) {
            callback(userObject);
        } else {
            UsersApi.avatarFromExternalProvider(userObject, function (userObject) {
                callback(userObject);
                pydio.user.preferences.set('external_avatar_loaded', true);
            });
        }
    };

    /**
     * Try to load avatar from plugin
     * @param userObject
     * @param callback
     */

    UsersApi.avatarFromExternalProvider = function avatarFromExternalProvider(userObject, callback) {

        if (UsersApi.avatarsCache[userObject.getId()] !== undefined) {
            userObject.setAvatar(UsersApi.avatarsCache[userObject.getId()]);
            callback(userObject);
            return;
        }

        if (_PydioApi2['default'].getClient().getPydioObject().getPluginConfigs('action.avatar').has("AVATAR_PROVIDER")) {
            callback(userObject);
            return;
        }
        var email = _PydioApi2['default'].getClient().getPydioObject().user.getPreference('email');
        if (!email) {
            callback(userObject);
            return;
        }
        var provider = _PydioApi2['default'].getClient().getPydioObject().getPluginConfigs('action.avatar').get("AVATAR_PROVIDER");
        var providerType = _PydioApi2['default'].getClient().getPydioObject().getPluginConfigs('action.avatar').get("GRAVATAR_TYPE");
        var url = undefined;
        var suffix = undefined;
        var https = document.location.protocol === 'https:';
        switch (provider) {
            case "gravatar":
                url = (https ? 'https://secure' : 'http://www') + '.gravatar.com/avatar/';
                suffix = "?s=80&r=g&d=" + providerType;
                break;
            case "libravatar":
                url = (https ? 'https://seccdn' : 'http://cdn') + '.libravatar.org/avatar/';
                suffix = "?s=80&d=" + providerType;
                break;
            default:
                break;
        }
        if (url) {
            url = url + _md52['default'](email.toLowerCase()) + suffix;
            UsersApi.avatarsCache[userObject.getId()] = url;
            userObject.setAvatar(url);
            callback(userObject);
        } else {
            callback(userObject);
        }
    };

    /**
     * Build avatar url from avatarId
     * @param userId
     * @param avatarId
     * @returns {*}
     */

    UsersApi.buildUserAvatarUrl = function buildUserAvatarUrl(userId) {
        var avatarId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        if (avatarId) {
            return _PydioApi2['default'].getClient().getPydioObject().Parameters.get('ENDPOINT_REST_API') + '/frontend/binaries/USER/' + userId;
        } else {
            return null;
        }
    };

    UsersApi.getPublicDataCache = function getPublicDataCache() {
        var cache = _MetaCacheService2['default'].getInstance();
        cache.registerMetaStream('user_public_data', 'EXPIRATION_MANUAL_TRIGGER');
        cache.registerMetaStream('user_public_data-graph', 'EXPIRATION_MANUAL_TRIGGER');
        return cache;
    };

    /**
     *
     * @param userId string
     * @param idmUser {IdmUser}
     * @return {Promise<any>}
     */

    UsersApi.getUserPromise = function getUserPromise(userId, idmUser) {
        var namespace = 'user_public_data';
        var cache = UsersApi.getPublicDataCache();
        var pydio = _PydioApi2['default'].getClient().getPydioObject();

        return new Promise(function (resolve, reject) {
            if (pydio && pydio.user && pydio.user.id === userId) {
                var userObject = new User(userId);
                UsersApi.loadLocalData(userObject, function (result) {
                    result.setLocal();
                    resolve(result);
                });
                return;
            }
            if (cache.hasKey(namespace, userId)) {
                (function () {
                    var obj = cache.getByKey(namespace, userId);
                    if (obj.isLoading()) {
                        obj.observe('loaded', function () {
                            resolve(obj);
                        });
                    } else {
                        resolve(obj);
                    }
                })();
            } else {
                (function () {
                    var userObject = undefined;
                    if (idmUser) {
                        userObject = User.fromIdmUser(idmUser);
                    } else {
                        userObject = new User(userId);
                    }
                    userObject.setLoading();
                    cache.setKey(namespace, userId, userObject);

                    UsersApi.loadPublicData(userObject, function (result) {
                        result.setLoaded();
                        cache.setKey(namespace, userId, result);
                        resolve(result);
                    }, function (error) {
                        userObject.setLoaded();
                        userObject.setNotFound();
                        cache.setKey(namespace, userId, userObject);
                        reject(error);
                    });
                })();
            }
        });
    };

    return UsersApi;
})();

UsersApi.avatarsCache = [];
UsersApi.avatarFromExternalProvider = _lodashDebounce2['default'](UsersApi.avatarFromExternalProvider, 500);

exports.User = User;
exports.UsersApi = UsersApi;
