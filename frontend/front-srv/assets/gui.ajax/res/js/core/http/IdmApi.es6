import UserServiceApi from "./gen/api/UserServiceApi";
import RestSearchUserRequest from "./gen/model/RestSearchUserRequest";
import IdmUserSingleQuery from "./gen/model/IdmUserSingleQuery";
import ServiceOperationType from "./gen/model/ServiceOperationType";
import IdmNodeType from "./gen/model/IdmNodeType";
import IdmUser from "./gen/model/IdmUser";
import LangUtils from "../util/LangUtils"
import RoleServiceApi from "./gen/api/RoleServiceApi";
import IdmRole from "./gen/model/IdmRole";
import RestSearchRoleRequest from "./gen/model/RestSearchRoleRequest";
import IdmRoleSingleQuery from "./gen/model/IdmRoleSingleQuery";
import uuid from 'uuid4'

class IdmApi {

    constructor(restClient){
        this.client = restClient;
    }

    /**
     *
     * @param baseGroup string
     * @param filterString string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @return Promise<IdmUser[]>
     */
    listUsers(baseGroup='/', filterString='', recursive = false, offset = 0, limit = -1){

        const api = new UserServiceApi(this.client);
        const request = new RestSearchUserRequest();
        request.Operation = ServiceOperationType.constructFromObject('AND');
        request.Queries = [];
        const query = new IdmUserSingleQuery();
        query.GroupPath = baseGroup;
        query.Recursive = recursive;
        query.NodeType = IdmNodeType.constructFromObject('USER');
        request.Queries.push(query);

        if(filterString){
            const queryString = new IdmUserSingleQuery();
            queryString.Login = filterString + '*';
            request.Queries.push(queryString);
        }

        const query2 = new IdmUserSingleQuery();
        query2.AttributeName = 'hidden';
        query2.AttributeValue = 'true';
        query2.not = true;
        request.Queries.push(query2);
        if(offset > 0){
            request.Offset = offset + '';
        }
        if(limit > -1){
            request.Limit = limit + '';
        }

        return api.searchUsers(request).then(value => {
            return value.Users || [];
        });

    }

    /**
     *
     * @param baseGroup string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @return Promise<RestUsersCollection>
     */
    listUsersGroups(baseGroup='/', recursive = false, offset = 0, limit = -1){

        const api = new UserServiceApi(this.client);
        const request = new RestSearchUserRequest();
        request.Operation = ServiceOperationType.constructFromObject('AND');
        request.Queries = [];
        const query = new IdmUserSingleQuery();
        query.GroupPath = baseGroup || '/';
        query.Recursive = recursive;
        query.NodeType = IdmNodeType.constructFromObject('UNKNOWN');
        request.Queries.push(query);

        const query2 = new IdmUserSingleQuery();
        query2.AttributeName = 'hidden';
        query2.AttributeValue = 'true';
        query2.not = true;
        request.Queries.push(query2);
        if(offset > 0){
            request.Offset = offset + '';
        }
        if(limit > -1){
            request.Limit = limit + '';
        }

        return api.searchUsers(request);

    }

    /**
     *
     * @param baseGroup string
     * @param filterString string
     * @param recursive boolean
     * @param offset integer
     * @param limit integer
     * @return {Promise<IdmUser[]>}
     */
    listGroups(baseGroup = '/', filterString='', recursive = false, offset = 0, limit = -1){

        const api = new UserServiceApi(this.client);
        const request = new RestSearchUserRequest();
        request.Operation = ServiceOperationType.constructFromObject('AND');
        request.Queries = [];
        const query = new IdmUserSingleQuery();
        query.GroupPath = baseGroup;
        query.Recursive = recursive;
        query.NodeType = IdmNodeType.constructFromObject('GROUP');
        request.Queries.push(query);

        if(filterString){
            const queryString = new IdmUserSingleQuery();
            queryString.AttributeName = 'displayName';
            queryString.AttributeValue = filterString + '*';
            request.Queries.push(queryString);
        }

        if(offset > 0){
            request.Offset = offset + '';
        }
        if(limit > -1){
            request.Limit = limit + '';
        }

        return api.searchUsers(request).then(value => {
            return value.Groups || [];
        });


    }

    listRoles(showTechnicalRoles = false, offset = 0, limit = -1){

        const api = new RoleServiceApi(this.client);
        const request = new RestSearchRoleRequest();
        if(offset > 0){
            request.Offset = offset + '';
        }
        if(limit > -1){
            request.Limit = limit + '';
        }
        if(!showTechnicalRoles){
            request.Queries = [];
            {
                const q = new IdmRoleSingleQuery();
                q.IsGroupRole = true;
                q.not = true;
                request.Queries.push(q);
            }
            {
                const q = new IdmRoleSingleQuery();
                q.IsUserRole = true;
                q.not = true;
                request.Queries.push(q);
            }
            {
                const q = new IdmRoleSingleQuery();
                q.IsTeam = true;
                q.not = true;
                request.Queries.push(q);
            }
            request.Operation = ServiceOperationType.constructFromObject('AND');
        }

        return api.searchRoles(request).then(coll => {
            return coll.Roles || [];
        });

    }

    /**
     *
     * @param baseGroup
     * @param groupIdentifier
     * @param displayName
     * @return {Promise}
     */
    createGroup(baseGroup = '/', groupIdentifier, displayName){
        const api = new UserServiceApi(this.client);
        const object = new IdmUser();
        object.IsGroup = true;
        object.GroupPath = LangUtils.trimRight(baseGroup, '/') + '/' + groupIdentifier;
        object.GroupLabel = groupIdentifier;
        object.Attributes = {"displayName": displayName};
        return api.putUser(groupIdentifier, object);
    }

    /**
     *
     * @param baseGroup string
     * @param login string
     * @param password string
     * @param profile string
     * @return {Promise}
     */
    createUser(baseGroup = '/', login, password, profile='standard'){
        const api = new UserServiceApi(this.client);
        const object = new IdmUser();
        object.GroupPath = baseGroup;
        object.Login = login;
        object.Password = password;
        object.Attributes = {profile: profile};
        return api.putUser(login, object);
    }

    /**
     * Create a role from scratch
     * @param roleLabel string
     * @return {Promise}
     */
    createRole(roleLabel) {
        const api = new RoleServiceApi(this.client);
        const idmRole = new IdmRole();
        idmRole.Uuid = uuid.sync();
        idmRole.Label = roleLabel;
        return api.setRole(idmRole.Uuid, idmRole)
    }

    /**
     *
     * @param idmUser {IdmUser}
     * @return {Promise}
     */
    updateIdmUser(idmUser){
        const api = new UserServiceApi(this.client);
        if(idmUser.IsGroup){
            return api.putUser(idmUser.GroupLabel, idmUser);
        } else {
            return api.putUser(idmUser.Login, idmUser);
        }
    }

    /**
     *
     * @param idmUser {IdmUser}
     * @return {Promise}
     */
    deleteIdmUser(idmUser){
        const api = new UserServiceApi(this.client);
        if(idmUser.IsGroup){
            const gPath = LangUtils.trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel + '/';
            if(gPath === '/'){
                return Promise.reject('cannot delete root group!');
            }
            return api.deleteUser(LangUtils.trimLeft(gPath, '/'));
        } else {
            return api.deleteUser(idmUser.Login);
        }
    }

    /**
     * Delete a role by Id
     * @param roleId
     * @return {Promise}
     */
    deleteRole(roleId){
        const api = new RoleServiceApi(this.client);
        return api.deleteRole(roleId);
    }

}

export {IdmApi as default}