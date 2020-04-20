"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Pydio = require('../Pydio');

var _Pydio2 = _interopRequireDefault(_Pydio);

var _genApiUserServiceApi = require("./gen/api/UserServiceApi");

var _genApiUserServiceApi2 = _interopRequireDefault(_genApiUserServiceApi);

var _genModelRestSearchUserRequest = require("./gen/model/RestSearchUserRequest");

var _genModelRestSearchUserRequest2 = _interopRequireDefault(_genModelRestSearchUserRequest);

var _genModelIdmUserSingleQuery = require("./gen/model/IdmUserSingleQuery");

var _genModelIdmUserSingleQuery2 = _interopRequireDefault(_genModelIdmUserSingleQuery);

var _genModelServiceOperationType = require("./gen/model/ServiceOperationType");

var _genModelServiceOperationType2 = _interopRequireDefault(_genModelServiceOperationType);

var _genModelIdmNodeType = require("./gen/model/IdmNodeType");

var _genModelIdmNodeType2 = _interopRequireDefault(_genModelIdmNodeType);

var _genModelIdmUser = require("./gen/model/IdmUser");

var _genModelIdmUser2 = _interopRequireDefault(_genModelIdmUser);

var _utilLangUtils = require("../util/LangUtils");

var _utilLangUtils2 = _interopRequireDefault(_utilLangUtils);

var _genApiRoleServiceApi = require("./gen/api/RoleServiceApi");

var _genApiRoleServiceApi2 = _interopRequireDefault(_genApiRoleServiceApi);

var _genModelIdmRole = require("./gen/model/IdmRole");

var _genModelIdmRole2 = _interopRequireDefault(_genModelIdmRole);

var _genModelRestSearchRoleRequest = require("./gen/model/RestSearchRoleRequest");

var _genModelRestSearchRoleRequest2 = _interopRequireDefault(_genModelRestSearchRoleRequest);

var _genModelIdmRoleSingleQuery = require("./gen/model/IdmRoleSingleQuery");

var _genModelIdmRoleSingleQuery2 = _interopRequireDefault(_genModelIdmRoleSingleQuery);

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var _genModelServiceResourcePolicy = require("./gen/model/ServiceResourcePolicy");

var _genModelServiceResourcePolicy2 = _interopRequireDefault(_genModelServiceResourcePolicy);

var _genApiGraphServiceApi = require("./gen/api/GraphServiceApi");

var _genApiGraphServiceApi2 = _interopRequireDefault(_genApiGraphServiceApi);

var IdmApi = (function () {
    function IdmApi(restClient) {
        _classCallCheck(this, IdmApi);

        this.client = restClient;
        this.autoWildCard = _Pydio2["default"].getInstance().getPluginConfigs('core.auth').get('USERS_LIST_AUTO_WILDCARD');
    }

    /**
     *
     * @param userLogin
     * @return {Promise<IdmUser>}
     */

    IdmApi.prototype.loadUser = function loadUser(userLogin) {
        var api = new _genApiUserServiceApi2["default"](this.client);
        var request = new _genModelRestSearchUserRequest2["default"]();
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');
        request.Queries = [];
        var query = new _genModelIdmUserSingleQuery2["default"]();
        query.Login = userLogin;
        query.NodeType = _genModelIdmNodeType2["default"].constructFromObject('USER');
        request.Queries.push(query);
        return api.searchUsers(request).then(function (collection) {
            return collection.Users ? collection.Users[0] : null;
        });
    };

    /**
     *
     * @param roleUuid
     * @return {Promise<IdmRole>}
     */

    IdmApi.prototype.loadRole = function loadRole(roleUuid) {
        var api = new _genApiRoleServiceApi2["default"](this.client);
        var request = new _genModelRestSearchRoleRequest2["default"]();
        request.Queries = [_genModelIdmRoleSingleQuery2["default"].constructFromObject({ Uuid: [roleUuid] })];
        return api.searchRoles(request).then(function (collection) {
            return collection.Roles ? collection.Roles[0] : null;
        });
    };

    /**
     *
     * @param baseGroup string
     * @param filterString string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @param profile string filter by profile
     * @return Promise<IdmUser[]>
     */

    IdmApi.prototype.listUsers = function listUsers() {
        var baseGroup = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
        var filterString = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var recursive = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var limit = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
        var profile = arguments.length <= 5 || arguments[5] === undefined ? '' : arguments[5];

        var api = new _genApiUserServiceApi2["default"](this.client);
        var request = new _genModelRestSearchUserRequest2["default"]();
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');
        request.Queries = [];
        var query = new _genModelIdmUserSingleQuery2["default"]();
        query.GroupPath = baseGroup || '/';
        query.Recursive = recursive;
        query.NodeType = _genModelIdmNodeType2["default"].constructFromObject('USER');
        request.Queries.push(query);

        if (filterString) {
            var queryString = new _genModelIdmUserSingleQuery2["default"]();
            if (this.autoWildCard) {
                filterString = '*' + filterString;
            }
            queryString.Login = filterString + '*';
            request.Queries.push(queryString);
        }
        if (profile) {
            var exclude = profile[0] === '!';
            var profileQ = new _genModelIdmUserSingleQuery2["default"]();
            profileQ.AttributeName = 'profile';
            profileQ.AttributeValue = exclude ? profile.substring(1) : profile;
            if (exclude) {
                profileQ.not = true;
            }
            request.Queries.push(profileQ);
        }

        var query2 = new _genModelIdmUserSingleQuery2["default"]();
        query2.AttributeName = 'hidden';
        query2.AttributeValue = 'true';
        query2.not = true;
        request.Queries.push(query2);
        if (offset > 0) {
            request.Offset = offset + '';
        }
        if (limit > -1) {
            request.Limit = limit + '';
        }

        return api.searchUsers(request).then(function (collection) {
            return { Users: collection.Users || [], Total: collection.Total, Offset: offset, Limit: limit };
        });
    };

    /**
     *
     * @param baseGroup string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @param profile string
     * @return Promise<RestUsersCollection>
     */

    IdmApi.prototype.listUsersGroups = function listUsersGroups() {
        var baseGroup = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
        var recursive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var limit = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];
        var profile = arguments.length <= 4 || arguments[4] === undefined ? "" : arguments[4];

        var p1 = this.listGroups(baseGroup, '', recursive, 0, 1000);
        var p2 = this.listUsers(baseGroup, '', recursive, offset, limit, profile);
        return Promise.all([p1, p2]).then(function (result) {
            var resGroups = result[0];
            var resUsers = result[1];

            return {
                Groups: resGroups.Groups || [],
                Users: resUsers.Users || [],
                Total: resUsers.Total,
                Offset: offset,
                Limit: limit
            };
        });
    };

    /**
     *
     * @param roleId string
     * @param offset integer
     * @param limit integer
     * @param filterString
     * @return Promise<RestUsersCollection>
     */

    IdmApi.prototype.listUsersWithRole = function listUsersWithRole(roleId) {
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var limit = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
        var filterString = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

        var api = new _genApiUserServiceApi2["default"](this.client);
        var request = new _genModelRestSearchUserRequest2["default"]();
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');
        request.Queries = [];
        var query = new _genModelIdmUserSingleQuery2["default"]();
        query.GroupPath = '/';
        query.Recursive = true;
        query.NodeType = _genModelIdmNodeType2["default"].constructFromObject('USER');
        request.Queries.push(query);
        var query2 = new _genModelIdmUserSingleQuery2["default"]();
        query2.HasRole = roleId;
        request.Queries.push(query2);
        if (filterString) {
            var queryString = new _genModelIdmUserSingleQuery2["default"]();
            if (this.autoWildCard) {
                filterString = '*' + filterString;
            }
            queryString.Login = filterString + '*';
            request.Queries.push(queryString);
        }

        if (offset > 0) {
            request.Offset = offset + '';
        }
        if (limit > -1) {
            request.Limit = limit + '';
        } else {
            request.Limit = '100';
        }

        return api.searchUsers(request).then(function (collection) {
            return { Users: collection.Users || [], Total: collection.Total, Offset: offset, Limit: limit };
        });
    };

    /**
     *
     * @param baseGroup string
     * @param filterString string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @return {Promise<IdmUser[]>}
     */

    IdmApi.prototype.listGroups = function listGroups() {
        var baseGroup = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
        var filterString = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var recursive = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
        var offset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
        var limit = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];

        var api = new _genApiUserServiceApi2["default"](this.client);
        var request = new _genModelRestSearchUserRequest2["default"]();
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');
        request.Queries = [];
        var query = new _genModelIdmUserSingleQuery2["default"]();
        query.GroupPath = baseGroup || '/';
        query.Recursive = recursive;
        query.NodeType = _genModelIdmNodeType2["default"].constructFromObject('GROUP');
        request.Queries.push(query);

        if (filterString) {
            // Use Login as for users, it will detect the trailing *
            var queryString = new _genModelIdmUserSingleQuery2["default"]();
            if (this.autoWildCard) {
                filterString = '*' + filterString;
            }
            queryString.Login = filterString + '*';
            request.Queries.push(queryString);
        }

        if (offset > 0) {
            request.Offset = offset + '';
        }
        if (limit > -1) {
            request.Limit = limit + '';
        }

        return api.searchUsers(request).then(function (value) {
            return { Groups: value.Groups || [], Total: value.Total, Offset: offset, Limit: limit };
        });
    };

    /**
     *
     * @param showTechnicalRoles boolean
     * @param offset int
     * @param limit int
     * @return {Promise<any>}
     */

    IdmApi.prototype.listRoles = function listRoles() {
        var showTechnicalRoles = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var limit = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

        var api = new _genApiRoleServiceApi2["default"](this.client);
        var request = new _genModelRestSearchRoleRequest2["default"]();
        if (offset > 0) {
            request.Offset = offset + '';
        }
        if (limit > -1) {
            request.Limit = limit + '';
        }
        if (showTechnicalRoles) {

            return api.searchRoles(request).then(function (coll) {
                return coll.Roles || [];
            });
        }
        // Exclude tech roles but still load ROOT_GROUP role
        request.Queries = [];
        {
            var q = new _genModelIdmRoleSingleQuery2["default"]();
            q.IsGroupRole = true;
            q.not = true;
            request.Queries.push(q);
        }
        {
            var q = new _genModelIdmRoleSingleQuery2["default"]();
            q.IsUserRole = true;
            q.not = true;
            request.Queries.push(q);
        }
        {
            var q = new _genModelIdmRoleSingleQuery2["default"]();
            q.IsTeam = true;
            q.not = true;
            request.Queries.push(q);
        }
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');

        var p1 = api.searchRoles(request).then(function (coll) {
            return coll.Roles || [];
        });
        var p2 = this.loadRole('ROOT_GROUP');
        return Promise.all([p1, p2]).then(function (result) {
            var roles = result[0];
            if (result[1] !== null) {
                roles = [result[1]].concat(roles);
            }
            return roles;
        });
    };

    /**
     *
     * @param filterString
     * @param offset
     * @param limit
     * @return {Promise<any>}
     */

    IdmApi.prototype.listTeams = function listTeams() {
        var filterString = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var limit = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];

        var api = new _genApiRoleServiceApi2["default"](this.client);
        var request = new _genModelRestSearchRoleRequest2["default"]();
        if (offset > 0) {
            request.Offset = offset + '';
        }
        if (limit > -1) {
            request.Limit = limit + '';
        }
        request.Queries = [];
        var q = new _genModelIdmRoleSingleQuery2["default"]();
        q.IsTeam = true;
        request.Queries.push(q);
        if (filterString) {
            var q2 = new _genModelIdmRoleSingleQuery2["default"]();
            if (this.autoWildCard) {
                filterString = '*' + filterString;
            }
            q2.Label = filterString + '*';
            request.Queries.push(q2);
        }
        request.Operation = _genModelServiceOperationType2["default"].constructFromObject('AND');

        return api.searchRoles(request).then(function (coll) {
            return { Teams: coll.Roles || [], Total: coll.Total, Offset: offset, Limit: limit };
        });
    };

    /**
     *
     * @param baseGroup
     * @param groupIdentifier
     * @param displayName
     * @return {Promise}
     */

    IdmApi.prototype.createGroup = function createGroup(baseGroup, groupIdentifier, displayName) {
        if (baseGroup === undefined) baseGroup = '/';

        var api = new _genApiUserServiceApi2["default"](this.client);
        var object = new _genModelIdmUser2["default"]();
        object.IsGroup = true;
        object.GroupPath = baseGroup || '/';
        object.GroupLabel = groupIdentifier;
        object.Attributes = { "displayName": displayName };
        return api.putUser(groupIdentifier, object);
    };

    /**
     *
     * @param baseGroup string
     * @param login string
     * @param password string
     * @param profile string
     * @return {Promise}
     */

    IdmApi.prototype.createUser = function createUser(baseGroup, login, password) {
        if (baseGroup === undefined) baseGroup = '/';
        var profile = arguments.length <= 3 || arguments[3] === undefined ? 'standard' : arguments[3];

        var api = new _genApiUserServiceApi2["default"](this.client);
        var object = new _genModelIdmUser2["default"]();
        object.GroupPath = baseGroup;
        object.Login = login;
        object.Password = password;
        object.Attributes = { profile: profile };
        return api.putUser(login, object);
    };

    /**
     *
     * @param data {*}
     * @param parametersDef []
     * @param existingUser {IdmUser}
     */

    IdmApi.prototype.putExternalUser = function putExternalUser(data, parametersDef) {
        var _this = this;

        var existingUser = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        var idmUser = existingUser || new _genModelIdmUser2["default"]();
        idmUser.Attributes = idmUser.Attributes || {};
        idmUser.Roles = idmUser.Roles || [];
        idmUser.Attributes["profile"] = "shared";

        parametersDef.forEach(function (param) {
            var name = param.name;
            var IdmUserField = param.IdmUserField;
            var scope = param.scope;
            var pluginId = param.pluginId;

            var value = data[name];
            if (IdmUserField) {
                idmUser[IdmUserField] = value;
            } else if (scope === 'user') {
                if (value === true || value === false) {
                    value = JSON.stringify(value);
                }
                idmUser.Attributes[name] = value;
            } else if (pluginId) {
                // This will be redispatched to user role in backend
                idmUser.Attributes["parameter:" + pluginId + ":" + name] = JSON.stringify(value);
            }
        });
        return pydio.user.getIdmUser().then(function (crtUser) {
            idmUser.GroupPath = crtUser.GroupPath;
            return _this.policiesForExternalUser(pydio.user, idmUser.Login).then(function (policies) {
                idmUser.Policies = policies;
                var api = new _genApiUserServiceApi2["default"](_this.client);
                return api.putUser(idmUser.Login, idmUser);
            });
        });
    };

    /**
     *
     * @param userLogin
     * @return {Promise<RestRelationResponse>}
     */

    IdmApi.prototype.loadUserGraph = function loadUserGraph(userLogin) {
        var api = new _genApiGraphServiceApi2["default"](this.client);
        return api.relation(userLogin);
    };

    /**
     * Create a role from scratch
     * @param roleLabel string
     * @return {Promise}
     */

    IdmApi.prototype.createRole = function createRole(roleLabel) {
        var api = new _genApiRoleServiceApi2["default"](this.client);
        var idmRole = new _genModelIdmRole2["default"]();
        idmRole.Uuid = _uuid42["default"]();
        idmRole.Label = roleLabel;
        return api.setRole(idmRole.Uuid, idmRole);
    };

    /**
     *
     * @param idmUser {IdmUser}
     * @return {Promise}
     */

    IdmApi.prototype.updateIdmUser = function updateIdmUser(idmUser) {
        var api = new _genApiUserServiceApi2["default"](this.client);
        if (idmUser.IsGroup) {
            return api.putUser(idmUser.GroupLabel, idmUser);
        } else {
            return api.putUser(idmUser.Login, idmUser);
        }
    };

    /**
     *
     * @param idmUser {IdmUser}
     * @return {Promise}
     */

    IdmApi.prototype.deleteIdmUser = function deleteIdmUser(idmUser) {
        var api = new _genApiUserServiceApi2["default"](this.client);
        if (idmUser.IsGroup) {
            var gPath = _utilLangUtils2["default"].trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel + '/';
            if (gPath === '/') {
                return Promise.reject('cannot delete root group!');
            }
            return api.deleteUser(_utilLangUtils2["default"].trimLeft(gPath, '/'));
        } else {
            return api.deleteUser(idmUser.Login);
        }
    };

    /**
     * Delete a role by Id
     * @param roleId
     * @return {Promise}
     */

    IdmApi.prototype.deleteRole = function deleteRole(roleId) {
        var api = new _genApiRoleServiceApi2["default"](this.client);
        return api.deleteRole(roleId);
    };

    /**
     * Create a team from a list of user Ids
     * @param teamName string
     * @param userIds array
     * @param callback optional callback
     * @return {Promise<T>}
     */

    IdmApi.prototype.saveSelectionAsTeam = function saveSelectionAsTeam(teamName, userIds, callback) {
        var _this2 = this;

        return this.policiesForUniqueUser(pydio.user).then(function (policies) {
            var roleApi = new _genApiRoleServiceApi2["default"](_this2.client);
            var role = new _genModelIdmRole2["default"]();
            role.Uuid = _utilLangUtils2["default"].computeStringSlug(teamName) + "-" + _uuid42["default"]().substr(0, 4);
            role.Label = teamName;
            role.IsTeam = true;
            role.Policies = policies;
            return roleApi.setRole(role.Uuid, role).then(function (r) {
                var ps = userIds.map(function (userId) {
                    return _this2.addUserToTeam(role.Uuid, userId, null);
                });
                return Promise.all(ps).then(function () {
                    if (callback) {
                        callback(r);
                    }
                });
            });
        });
    };

    /**
     *
     * @param teamId
     * @param userLogin
     * @param callback
     * @return {Promise<[any , any]>}
     */

    IdmApi.prototype.addUserToTeam = function addUserToTeam(teamId, userLogin, callback) {

        var userApi = new _genApiUserServiceApi2["default"](this.client);
        var p1 = this.loadUser(userLogin);
        var p2 = this.loadRole(teamId);
        return Promise.all([p1, p2]).then(function (result) {
            var user = result[0];
            var role = result[1];

            if (!user || !role) {
                throw new Error('Cannot find user or team!');
            }
            user.Roles = user.Roles || [];
            user.Roles.push(role);
            return userApi.putRoles(userLogin, user).then(function () {
                if (callback) {
                    callback();
                }
            });
        });
    };

    /**
     *
     * @param teamId
     * @param userLogin
     * @param callback
     * @return {Promise<[any , any]>}
     */

    IdmApi.prototype.removeUserFromTeam = function removeUserFromTeam(teamId, userLogin, callback) {

        var userApi = new _genApiUserServiceApi2["default"](this.client);
        return this.loadUser(userLogin).then(function (u) {
            if (!u) {
                throw new Error('Cannot find user!');
            }
            u.Roles = u.Roles || [];
            u.Roles = u.Roles.filter(function (r) {
                return r.Uuid !== teamId;
            });

            if (callback) {
                callback(u);
            }
            return userApi.putRoles(userLogin, u).then(function () {
                if (callback) {
                    callback();
                }
            });
        });
    };

    /**
     *
     * @param teamId
     * @param newLabel
     * @param callback
     * @return {Promise<IdmRole>}
     */

    IdmApi.prototype.updateTeamLabel = function updateTeamLabel(teamId, newLabel, callback) {
        var roleApi = new _genApiRoleServiceApi2["default"](this.client);
        return this.loadRole(teamId).then(function (r) {
            if (!r) {
                throw new Error('Cannot find team!');
            }
            r.Label = newLabel;
            return roleApi.setRole(r.Uuid, r).then(function () {
                if (callback) {
                    callback();
                }
            });
        });
    };

    /**
     *
     * @param currentUser
     * @return {Promise<Array>}
     */

    IdmApi.prototype.policiesForUniqueUser = function policiesForUniqueUser(currentUser) {
        return currentUser.getIdmUser().then(function (idmUser) {
            return [_genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: idmUser.Uuid,
                Action: 'OWNER',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + idmUser.Login,
                Action: 'READ',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + idmUser.Login,
                Action: 'WRITE',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "profile:admin",
                Action: 'WRITE',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "profile:admin",
                Action: 'READ',
                Effect: 'allow'
            })];
        });
    };

    /**
     *
     * @param currentUser
     * @param newUserLogin
     * @return {Promise<Array>}
     */

    IdmApi.prototype.policiesForExternalUser = function policiesForExternalUser(currentUser, newUserLogin) {
        return currentUser.getIdmUser().then(function (idmUser) {
            return [_genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: idmUser.Uuid,
                Action: 'OWNER',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + idmUser.Login,
                Action: 'READ',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + idmUser.Login,
                Action: 'WRITE',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + newUserLogin,
                Action: 'READ',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "user:" + newUserLogin,
                Action: 'WRITE',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "profile:admin",
                Action: 'WRITE',
                Effect: 'allow'
            }), _genModelServiceResourcePolicy2["default"].constructFromObject({
                Subject: "profile:admin",
                Action: 'READ',
                Effect: 'allow'
            })];
        });
    };

    return IdmApi;
})();

exports["default"] = IdmApi;
module.exports = exports["default"];
