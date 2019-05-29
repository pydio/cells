/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _PydioApi = require('./PydioApi');

var _PydioApi2 = _interopRequireDefault(_PydioApi);

var _genIndex = require('./gen/index');

var Policies = (function () {
    function Policies() {
        _classCallCheck(this, Policies);
    }

    /**
     *
     * @param wsId
     * @return {{api: WorkspaceServiceApi, request: RestSearchWorkspaceRequest}}
     */

    Policies.workspaceData = function workspaceData(wsId) {
        var api = new _genIndex.WorkspaceServiceApi(_PydioApi2['default'].getRestClient());
        var request = new _genIndex.RestSearchWorkspaceRequest();
        var query = new _genIndex.IdmWorkspaceSingleQuery();
        query.uuid = wsId;
        request.Queries = [query];
        return { api: api, request: request };
    };

    /**
     *
     * @param wsId
     * @return {Promise}
     */

    Policies.workspacePolicies = function workspacePolicies(wsId) {
        var _Policies$workspaceData = Policies.workspaceData(wsId);

        var api = _Policies$workspaceData.api;
        var request = _Policies$workspaceData.request;

        return new Promise(function (resolve, reject) {
            api.searchWorkspaces(request).then(function (result) {
                if (result.Total === 0 || !result.Workspaces) {
                    reject(new Error('Cannot find workspace'));
                }
                var idmRole = result.Workspaces[0];
                resolve(idmRole.Policies);
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    /**
     *
     * @param wsId
     * @param policies
     * @return {Promise}
     */

    Policies.saveWorkspacesPolicies = function saveWorkspacesPolicies(wsId, policies) {
        var _Policies$workspaceData2 = Policies.workspaceData(wsId);

        var api = _Policies$workspaceData2.api;
        var request = _Policies$workspaceData2.request;

        return new Promise(function (resolve, reject) {
            api.searchWorkspaces(request).then(function (result) {
                if (result.Total === 0 || !result.Workspaces) {
                    reject(new Error('Cannot find workspace!'));
                }
                var idmWorkspace = result.Workspaces[0];
                idmWorkspace.Policies = policies;
                api.putWorkspace(idmWorkspace.Slug, idmWorkspace).then(function (result) {
                    resolve(result.Policies);
                })['catch'](function (reason) {
                    reject(reason);
                });
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    Policies.saveSharePolicies = function saveSharePolicies(shareId, policies) {
        var _Policies$workspaceData3 = Policies.workspaceData(shareId);

        var api = _Policies$workspaceData3.api;
        var request = _Policies$workspaceData3.request;

        return api.searchWorkspaces(request).then(function (result) {
            if (result.Total === 0 || !result.Workspaces) {
                throw new Error('Cannot find share!');
            }
            var shareApi = new _genIndex.ShareServiceApi(_PydioApi2['default'].getRestClient());
            var shareRequest = new _genIndex.RestUpdateSharePoliciesRequest();
            shareRequest.Uuid = shareId;
            shareRequest.Policies = policies;
            return shareApi.updateSharePolicies(shareRequest).then(function (response) {
                return response.Policies;
            });
        });
    };

    /**
     *
     * @param roleId
     * @return {{api: RoleServiceApi, request: RestSearchRoleRequest}}
     */

    Policies.roleData = function roleData(roleId) {
        var api = new _genIndex.RoleServiceApi(_PydioApi2['default'].getRestClient());
        var request = new _genIndex.RestSearchRoleRequest();
        var query = new _genIndex.IdmRoleSingleQuery();
        query.IsTeam = true;
        query.Uuid = [roleId];
        request.Queries = [query];
        return { api: api, request: request };
    };

    /**
     *
     * @param roleId
     * @return {Promise}
     */

    Policies.rolesPolicies = function rolesPolicies(roleId) {
        var _Policies$roleData = Policies.roleData(roleId);

        var api = _Policies$roleData.api;
        var request = _Policies$roleData.request;

        return new Promise(function (resolve, reject) {
            api.searchRoles(request).then(function (result) {
                if (result.Total === 0 || !result.Roles) {
                    reject(new Error('Cannot find role'));
                }
                var idmRole = result.Roles[0];
                resolve(idmRole.Policies);
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    /**
     *
     * @param roleId
     * @param policies
     * @return {Promise}
     */

    Policies.saveRolesPolicies = function saveRolesPolicies(roleId, policies) {
        var _Policies$roleData2 = Policies.roleData(roleId);

        var api = _Policies$roleData2.api;
        var request = _Policies$roleData2.request;

        return new Promise(function (resolve, reject) {
            api.searchRoles(request).then(function (result) {
                if (result.Total === 0 || !result.Roles) {
                    reject(new Error('Cannot find role'));
                }
                var idmRole = result.Roles[0];
                idmRole.Policies = policies;
                api.setRole(idmRole.Uuid, idmRole).then(function (result) {
                    resolve(result.Policies);
                })['catch'](function (reason) {
                    reject(reason);
                });
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    /**
     *
     * @param userId
     * @return {{api: UserServiceApi, request: RestSearchUserRequest}}
     */

    Policies.userData = function userData(userId) {
        var api = new _genIndex.UserServiceApi(_PydioApi2['default'].getRestClient());
        var request = new _genIndex.RestSearchUserRequest();
        var query = new _genIndex.IdmUserSingleQuery();
        query.Login = userId;
        request.Queries = [query];
        return { api: api, request: request };
    };

    /**
     *
     * @param userId
     * @return {Promise}
     */

    Policies.userPolicies = function userPolicies(userId) {
        var _Policies$userData = Policies.userData(userId);

        var api = _Policies$userData.api;
        var request = _Policies$userData.request;

        return new Promise(function (resolve, reject) {
            api.searchUsers(request).then(function (result) {
                if (result.Total === 0 || !result.Users) {
                    reject(new Error('Cannot find user'));
                }
                var idmUser = result.Users[0];
                resolve(idmUser.Policies);
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    /**
     *
     * @param userId
     * @param policies
     * @return {Promise}
     */

    Policies.saveUserPolicies = function saveUserPolicies(userId, policies) {
        var _Policies$userData2 = Policies.userData(userId);

        var api = _Policies$userData2.api;
        var request = _Policies$userData2.request;

        return new Promise(function (resolve, reject) {
            api.searchUsers(request).then(function (result) {
                if (result.Total === 0 || !result.Users) {
                    reject(new Error('Cannot find user'));
                }
                var idmUser = result.Users[0];
                idmUser.Policies = policies;
                api.putUser(idmUser.Login, idmUser).then(function (result) {
                    resolve(result.Policies);
                })['catch'](function (reason) {
                    reject(reason);
                });
            })['catch'](function (error) {
                reject(error);
            });
        });
    };

    /**
     *
     * @param resourceType
     * @param resourceId
     * @return Promise
     */

    Policies.loadPolicies = function loadPolicies(resourceType, resourceId) {
        switch (resourceType) {
            case 'user':
                return Policies.userPolicies(resourceId);
            case 'team':
                return Policies.rolesPolicies(resourceId);
            case 'workspace':
            case 'cell':
            case 'link':
                return Policies.workspacePolicies(resourceId);
            default:
                return Promise.reject(new Error('Unsupported resource type ' + resourceType));
        }
    };

    /**
     *
     * @param resourceType
     * @param resourceId
     * @param policies
     * @return {Promise}
     */

    Policies.savePolicies = function savePolicies(resourceType, resourceId, policies) {
        switch (resourceType) {
            case 'user':
                return Policies.saveUserPolicies(resourceId, policies);
            case 'team':
                return Policies.saveRolesPolicies(resourceId, policies);
            case 'workspace':
                return Policies.saveWorkspacesPolicies(resourceId, policies);
            case 'cell':
            case 'link':
                return Policies.saveSharePolicies(resourceId, policies);
            default:
                return Promise.reject(new Error('Unsupported resource type ' + resourceType));
        }
    };

    return Policies;
})();

exports['default'] = Policies;
module.exports = exports['default'];
