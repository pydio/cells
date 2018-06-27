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
import PydioApi from './PydioApi'
import Observable from '../lang/Observable'
import MetaCacheService from './MetaCacheService'
import {RoleServiceApi, IdmRoleSingleQuery, RestSearchRoleRequest, IdmUser, IdmRole} from './gen/index';
import debounce from 'lodash.debounce'
import md5 from 'md5'

class User extends Observable{
    _id;
    _label;
    _type;
    _group;
    _avatar;
    _temporary;
    _external;
    _extendedLabel;
    _graph;
    _loading;
    _local;
    _uuid;

    IdmUser;
    IdmRole;

    _avatarUrl;
    _avatarUrlLoaded;

    constructor(id, label, type, group, avatar, temporary, external, extendedLabel){
        super();
        this._id = id;
        this._label = label;
        this._type = type;
        if(this._type === 'group'){
            this._group = id;
        }
        this._avatar = avatar;
        this._temporary = temporary;
        this._external = external;
        this._extendedLabel = extendedLabel;
    }

    /**
     * @param idmUser {IdmUser}
     * @return {User}
     */
    static fromIdmUser(idmUser){
        let u = new User(
            idmUser.Login,
            idmUser.Attributes['displayName'] || idmUser.Login,
            'user',
            '',
            idmUser.Attributes['avatar'],
            false,
            idmUser.Attributes['profile'] === 'shared',
        );
        u._uuid = idmUser.Uuid;
        u.IdmUser = idmUser;
        return u;
    }

    static fromObject(user){
        let u = new User(
            user.id,
            user.label,
            user.type,
            user.group,
            user.avatar,
            user.temporary,
            user.external
        );
        if (user.uuid){
            u._uuid = user.uuid;
        }
        return u;
    }

    asObject(){
        return {
            id:this._id,
            uuid:this._uuid,
            label:this._label,
            type:this._type,
            group:this._group,
            avatar:this._avatar,
            temporary:this._temporary,
            external:this._external,
            extendedLabel:this._extendedLabel
        }
    }

    getUuid() {
        return this._uuid;
    }

    getId() {
        return this._id;
    }

    getLabel() {
        return this._label;
    }
    setLabel(label){
        this._label = label;
    }

    getGraph() {
        return this._graph;
    }
    setGraph(graph){
        this._graph = graph;
    }

    getType() {
        return this._type;
    }

    getGroup() {
        return this._group;
    }

    getAvatar() {
        return this._avatar;
    }

    setAvatar(avatar){
        this._avatar = avatar;
    }

    getTemporary() {
        return this._temporary;
    }

    getExternal() {
        return this._external;
    }

    getExtendedLabel() {
        return this._extendedLabel;
    }

    isLoading(){
        return this._loading;
    }
    setLoaded(){
        this._loading = false;
        this.notify('loaded');
    }
    setLoading(){
        this._loading = true;
    }
    setLocal(){
        this._local = true;
    }
    isLocal(){
        return this._local;
    }
}


class UsersApi{

    static authorizedUsersStartingWith(token, callback, usersOnly=false, existingOnly=false){

        let params = {
            get_action:'user_list_authorized_users',
            value:token,
            format:'json'
        };
        if(usersOnly){
            params['users_only'] = 'true';
        }
        if(existingOnly){
            params['existing_only'] = 'true';
        }
        PydioApi.getClient().request(params, function(transport){
            let suggestions = [];
            const data = transport.responseJSON;
            if (data){
                data.map(function(entry){
                    const {id, label, type, group, avatar, temporary, external, uuid} = entry;
                    let u = new User(id, label, type, group, avatar, temporary, external, label);
                    if(uuid) {
                        u._uuid = uuid;
                    }
                    if(entry.IdmUser){
                        u.IdmUser = IdmUser.constructFromObject(entry.IdmUser, null)
                    } else if (entry.IdmRole){
                        u.IdmRole = IdmRole.constructFromObject(entry.IdmRole, null);
                    }
                    suggestions.push(u);
                });
            }
            callback(suggestions);
        });

    }

    static createUserFromPost(postValues, callback){
        postValues['get_action'] = 'user_create_user';
        PydioApi.getClient().request(postValues, function(transport){
            callback(postValues, transport.responseJSON);
            const u = transport.responseJSON.user;
            const cache = MetaCacheService.getInstance();
            if(u && cache.hasKey('user_public_data', u.id)){
                cache.deleteKey('user_public_data', u.id);
            }

        }.bind(this));
    }

    static deleteUser(userId, callback){
        PydioApi.getClient().request({
            get_action:'user_delete_user',
            user_id:userId
        }, function(transport){
            callback();
        });
    }

    static saveSelectionSupported(){
        return global.pydio.getController().actions.get('user_team_create') !== undefined;
    }

    static deleteTeam(teamId, callback){
        teamId = teamId.replace('/USER_TEAM/', '');
        PydioApi.getClient().request({
            get_action:'user_team_delete',
            team_id:teamId
        }, function(transport){
            callback(transport.responseJSON);
        });
    }

    static saveSelectionAsTeam(teamName, userIds, callback){
        PydioApi.getClient().request({
            get_action:'user_team_create',
            team_label:teamName,
            'user_ids[]':userIds
        }, function(transport){
            callback(transport.responseJSON);
        });
    }

    static addUserToTeam(teamId, userId, callback){
        teamId = teamId.replace('/USER_TEAM/', '');
        PydioApi.getClient().request({
            get_action:'user_team_add_user',
            team_id:teamId,
            user_id:userId
        }, function(transport){
            callback(transport.responseJSON);
        });
    }

    static removeUserFromTeam(teamId, userId, callback){
        teamId = teamId.replace('/USER_TEAM/', '');
        PydioApi.getClient().request({
            get_action:'user_team_delete_user',
            team_id:teamId,
            user_id:userId
        }, function(transport){
            callback(transport.responseJSON);
        });
    }

    static updateTeamLabel(teamId, newLabel,callback){
        teamId = teamId.replace('/USER_TEAM/', '');
        PydioApi.getClient().request({
            get_action:'user_team_update_label',
            team_id:teamId,
            team_label:newLabel
        }, function(transport){
            callback(transport.responseJSON);
        });
    }

    /**
     *
     * @param userObject {User}
     * @param loadGraph Object
     * @param callback Function
     */
    static loadPublicData(userObject, loadGraph, callback){

        const userId = userObject.getId();
        PydioApi.getClient().request({
            get_action:'user_public_data',
            user_id:userId,
            graph: loadGraph
        }, function(transport){
            const data = transport.responseJSON;
            if(!data || data.error){
                userObject.setLabel(userId);
                callback(userObject);
                return;
            }
            const {user, graph} = data;
            Object.keys(user).map(k => {
                userObject[k] = user[k];
            });
            let avatarUrl;
            const avatarId = user.avatar || null;
            const label = user.label || userId;
            userObject.setGraph(graph);
            userObject.setLabel(label);
            if (user.avatar) {
                avatarUrl = UsersApi.buildUserAvatarUrl(userId, avatarId);
                userObject.setAvatar(avatarUrl);
                callback(userObject);
            } else {
                UsersApi.avatarFromExternalProvider(userObject, callback);
            }

        }.bind(this));

    }

    static loadLocalData(userObject, callback){

        const pydio = PydioApi.getClient().getPydioObject();
        if(!pydio || !pydio.user){
            callback(userObject);
            return;
        }
        userObject.setLocal(true);
        const userName = pydio.user.getPreference('displayName') || pydio.user.id;
        userObject.setLabel(userName);

        const avatarUrl = UsersApi.buildUserAvatarUrl(pydio.user.id, pydio.user.getPreference('avatar'));
        if (avatarUrl) {
            userObject.setAvatar(avatarUrl);
            callback(userObject);
        } else if (pydio.user.preferences.has('external_avatar_loaded')){
            callback(userObject);
        } else {
            UsersApi.avatarFromExternalProvider(userObject, (userObject) => {
                callback(userObject);
                pydio.user.preferences.set('external_avatar_loaded', true);
            });
        }

    }

    /**
     * Try to load avatar from plugin
     * @param userObject
     * @param callback
     */
    static avatarFromExternalProvider(userObject, callback){

        if (UsersApi.avatarsCache[userObject.getId] !== undefined){
            userObject.setAvatar(UsersApi.avatarsCache[userObject.getId]);
            callback(userObject);
            return;
        }

        if(PydioApi.getClient().getPydioObject().getPluginConfigs('action.avatar').has("AVATAR_PROVIDER")) {
            callback(userObject);
            return;
        }
        const email = PydioApi.getClient().getPydioObject().user.getPreference('email');
        if(!email){
            callback(userObject);
            return;
        }
        const provider = PydioApi.getClient().getPydioObject().getPluginConfigs('action.avatar').get("AVATAR_PROVIDER");
        const providerType = PydioApi.getClient().getPydioObject().getPluginConfigs('action.avatar').get("GRAVATAR_TYPE");
        let url;
        let suffix;
        const https = document.location.protocol === 'https:';
        switch (provider){
            case "gravatar":
                url = (https?'https://secure':'http://www') + '.gravatar.com/avatar/';
                suffix = "?s=80&r=g&d=" + providerType;
                break;
            case "libravatar":
                url = (https?'https://seccdn':'http://cdn') + '.libravatar.org/avatar/';
                suffix = "?s=80&d=" + providerType;
                break;
            default:
                break;
        }
        if (url) {
            url = url + md5(email.toLowerCase()) + suffix;
            UsersApi.avatarsCache[userObject.getId()] = url;
            userObject.setAvatar(url);
            callback(userObject);
        } else {
            callback(userObject);
        }

    }

    /**
     * Build avatar url from avatarId
     * @param userId
     * @param avatarId
     * @returns {*}
     */
    static buildUserAvatarUrl(userId, avatarId = null){

        if(avatarId){
            return PydioApi.getClient().getPydioObject().Parameters.get('ajxpServerAccess')
                + "&get_action=get_binary_param&binary_id="
                + avatarId + "&user_id=" + userId;
        }else{
            return null;
        }

    }

    static getPublicDataCache() {
        const cache = MetaCacheService.getInstance();
        cache.registerMetaStream('user_public_data', 'EXPIRATION_MANUAL_TRIGGER');
        cache.registerMetaStream('user_public_data-graph', 'EXPIRATION_MANUAL_TRIGGER');
        return cache;
    }

    static getUserPromise(userId, withGraph = false){
        const namespace = withGraph ? 'user_public_data-graph' :'user_public_data';
        const cache = UsersApi.getPublicDataCache();
        const pydio = PydioApi.getClient().getPydioObject();

        return new Promise((resolve, reject) => {
            if(pydio && pydio.user && pydio.user.id === userId){
                let userObject = new User(userId);
                UsersApi.loadLocalData(userObject, (result) => {
                    result.setLocal();
                    resolve(result);
                });
                return;
            }
            if(cache.hasKey(namespace, userId)){
                const obj = cache.getByKey(namespace, userId);
                if (obj.isLoading()){
                    obj.observe('loaded', ()=>{
                        resolve(obj);
                    })
                } else {
                    resolve(obj);
                }
            } else {
                let userObject = new User(userId);
                userObject.setLoading();
                cache.setKey(namespace, userId, userObject);

                UsersApi.loadPublicData(userObject, withGraph, (result) => {
                    result.setLoaded();
                    cache.setKey(namespace, userId, result);
                    resolve(result);
                });
            }
        });
    }

    static listUserVisibleTeams(userId) {
        const api = new RoleServiceApi(PydioApi.getRestClient());
        let request = new RestSearchRoleRequest();
        let query = new IdmRoleSingleQuery();
        query.IsTeam = true;
        request.Queries = [query];
        return api.searchRoles(request);
    }

}

UsersApi.avatarsCache = [];
UsersApi.avatarFromExternalProvider = debounce(UsersApi.avatarFromExternalProvider, 500);

export {User, UsersApi}