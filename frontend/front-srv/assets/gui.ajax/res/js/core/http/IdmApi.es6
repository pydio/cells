import UserServiceApi from "./gen/api/UserServiceApi";
import RestSearchUserRequest from "./gen/model/RestSearchUserRequest";
import IdmUserSingleQuery from "./gen/model/IdmUserSingleQuery";
import ServiceOperationType from "./gen/model/ServiceOperationType";
import IdmNodeType from "./gen/model/IdmNodeType";
import IdmUser from "./gen/model/IdmUser";
import LangUtils from "../util/LangUtils"
import RoleServiceApi from "./gen/api/RoleServiceApi";
import RestSearchRoleRequest from "./gen/model/RestSearchRoleRequest";
import IdmRoleSingleQuery from "./gen/model/IdmRoleSingleQuery";

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
        query.GroupPath = baseGroup;
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

    createUser(baseGroup = '/', login, password){
        const api = new UserServiceApi(this.client);
        const object = new IdmUser();
        object.GroupPath = baseGroup;
        object.Login = login;
        object.Password = password;
        return api.putUser(login, object);
    }

}

export {IdmApi as default}