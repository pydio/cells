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
import PydioApi from './PydioApi'
import {UserServiceApi, IdmUserSingleQuery, RestSearchUserRequest,
    RoleServiceApi, IdmRoleSingleQuery, RestSearchRoleRequest,
    WorkspaceServiceApi, IdmWorkspaceSingleQuery, RestSearchWorkspaceRequest, ShareServiceApi, RestUpdateSharePoliciesRequest} from 'cells-sdk';

class Policies {

    /**
     *
     * @param wsId
     * @return {{api: WorkspaceServiceApi, request: RestSearchWorkspaceRequest}}
     */
    static workspaceData(wsId){
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        let request = new RestSearchWorkspaceRequest();
        let query = new IdmWorkspaceSingleQuery();
        query.uuid = wsId;
        request.Queries = [query];
        return {api, request};
    }

    /**
     *
     * @param wsId
     * @return {Promise}
     */
    static workspacePolicies(wsId){
        const {api, request} = Policies.workspaceData(wsId);
        return new Promise((resolve, reject) => {
            api.searchWorkspaces(request).then((result) => {
                if (result.Total === 0 || !result.Workspaces) {
                    reject(new Error('Cannot find workspace'));
                }
                const idmRole = result.Workspaces[0];
                resolve(idmRole.Policies);
            }).catch((error) => {
                reject(error);
            })
        });
    }

    /**
     *
     * @param wsId
     * @param policies
     * @return {Promise}
     */
    static saveWorkspacesPolicies(wsId, policies){
        const {api, request} = Policies.workspaceData(wsId);
        return new Promise((resolve, reject) => {
            api.searchWorkspaces(request).then((result) => {
                if (result.Total === 0 || !result.Workspaces) {
                    reject(new Error('Cannot find workspace!'));
                }
                const idmWorkspace = result.Workspaces[0];
                idmWorkspace.Policies = policies;
                api.putWorkspace(idmWorkspace.Slug, idmWorkspace).then(result => {
                    resolve(result.Policies);
                }).catch(reason => {
                    reject(reason);
                });
            }).catch((error) => {
                reject(error);
            })
        });
    }

    static saveSharePolicies(shareId, policies) {
        const {api, request} = Policies.workspaceData(shareId);
        return api.searchWorkspaces(request).then((result) => {
            if (result.Total === 0 || !result.Workspaces) {
                throw new Error('Cannot find share!');
            }
            const shareApi = new ShareServiceApi(PydioApi.getRestClient());
            const shareRequest = new RestUpdateSharePoliciesRequest();
            shareRequest.Uuid = shareId;
            shareRequest.Policies = policies;
            return shareApi.updateSharePolicies(shareRequest).then(response => {
                return response.Policies
            });
        })
    }

    /**
     *
     * @param roleId
     * @return {{api: RoleServiceApi, request: RestSearchRoleRequest}}
     */
    static roleData(roleId){
        const api = new RoleServiceApi(PydioApi.getRestClient());
        let request = new RestSearchRoleRequest();
        let query = new IdmRoleSingleQuery();
        query.IsTeam = true;
        query.Uuid = [roleId];
        request.Queries = [query];
        return {api, request};
    }

    /**
     *
     * @param roleId
     * @return {Promise}
     */
    static rolesPolicies(roleId){
        const {api, request} = Policies.roleData(roleId);
        return new Promise((resolve, reject) => {
            api.searchRoles(request).then((result) => {
                if (result.Total === 0 || !result.Roles) {
                    reject(new Error('Cannot find role'));
                }
                const idmRole = result.Roles[0];
                resolve(idmRole.Policies);
            }).catch((error) => {
                reject(error);
            })
        });
    }

    /**
     *
     * @param roleId
     * @param policies
     * @return {Promise}
     */
    static saveRolesPolicies(roleId, policies){
        const {api, request} = Policies.roleData(roleId);
        return new Promise((resolve, reject) => {
            api.searchRoles(request).then((result) => {
                if (result.Total === 0 || !result.Roles) {
                    reject(new Error('Cannot find role'));
                }
                const idmRole = result.Roles[0];
                idmRole.Policies = policies;
                api.setRole(idmRole.Uuid, idmRole).then(result => {
                    resolve(result.Policies);
                }).catch(reason => {
                    reject(reason);
                });
            }).catch((error) => {
                reject(error);
            })
        });

    }

    /**
     *
     * @param userId
     * @return {{api: UserServiceApi, request: RestSearchUserRequest}}
     */
    static userData(userId){
        const api = new UserServiceApi(PydioApi.getRestClient());
        let request = new RestSearchUserRequest();
        let query = new IdmUserSingleQuery();
        query.Login = userId;
        request.Queries = [query];
        return {api, request};
    }
    /**
     *
     * @param userId
     * @return {Promise}
     */
    static userPolicies(userId){

        const {api, request} = Policies.userData(userId);
        return new Promise((resolve, reject) => {
            api.searchUsers(request).then((result) => {
                if (result.Total === 0 || !result.Users) {
                    reject(new Error('Cannot find user'));
                }
                const idmUser = result.Users[0];
                resolve(idmUser.Policies);
            }).catch((error) => {
                reject(error);
            })
        });

    }

    /**
     *
     * @param userId
     * @param policies
     * @return {Promise}
     */
    static saveUserPolicies(userId, policies){

        const {api, request} = Policies.userData(userId);
        return new Promise((resolve, reject) => {
            api.searchUsers(request).then((result) => {
                if (result.Total === 0 || !result.Users) {
                    reject(new Error('Cannot find user'));
                }
                const idmUser = result.Users[0];
                idmUser.Policies = policies;
                api.putUser(idmUser.Login, idmUser).then(result => {
                    resolve(result.Policies);
                }).catch(reason => {
                    reject(reason);
                });
            }).catch((error) => {
                reject(error);
            })
        });

    }

    /**
     *
     * @param resourceType
     * @param resourceId
     * @return Promise
     */
    static loadPolicies(resourceType, resourceId) {
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

    }

    /**
     *
     * @param resourceType
     * @param resourceId
     * @param policies
     * @return {Promise}
     */
    static savePolicies(resourceType, resourceId, policies){
        switch (resourceType){
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
    }

}

export {Policies as default}