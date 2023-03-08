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
import {IdmUser} from 'cells-sdk';
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
    _public;
    _extendedLabel;
    _graph;
    _loading;
    _local;
    _uuid;
    _notFound;

    IdmUser;
    IdmRole;

    _avatarUrl;
    _avatarUrlLoaded;

    constructor(id, label = '', type = 'user', group = '', avatar = '', temporary = false, external = false, extendedLabel = null){
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
     *
     * @param idmUser {IdmUser}
     */
    setIdmUser(idmUser){
        this.IdmUser = idmUser;
        this._uuid = idmUser.Uuid;

        const attributes = idmUser.Attributes || {};
        this._label = attributes['displayName'] || idmUser.Login;
        this._type = 'user';
        this._group = '';
        this._avatar = attributes['avatar'];
        this._temporary = false;
        this._external = attributes['profile'] === 'shared';
        this._public = attributes['hidden'] === 'true';
    }

    /**
     * @param idmUser {IdmUser}
     * @return {User}
     */
    static fromIdmUser(idmUser){
        const u = new User(idmUser.Login);
        u.setIdmUser(idmUser);
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
    setNotFound(){
        this._notFound = true;
    }
    isNotFound(){
        return this._notFound;
    }
    isPublic(){
        return this._public;
    }
}


class UsersApi{

    /**
     *
     * @return {boolean}
     */
    static saveSelectionSupported(){
        const pydio = PydioApi.getClient().getPydioObject();
        if(pydio){
            return pydio.getController().actions.get('user_team_create') !== undefined;
        }else {
            return false;
        }

    }

    /**
     *
     * @param userObject {User}
     * @param callback Function
     * @param errorCallback Function
     */
    static loadPublicData(userObject, callback, errorCallback){

        const userId = userObject.getId();
        userObject.setLabel(userId);
        if(userObject.IdmUser){
            if(userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["avatar"]){
                userObject.setAvatar(UsersApi.buildUserAvatarUrl(userId, userObject.IdmUser.Attributes["avatar"]));
            } else {
                UsersApi.avatarFromExternalProvider(userObject, callback);
            }
            if(userObject.IdmUser.Attributes && userObject.IdmUser.Attributes["displayName"]) {
                userObject.setLabel(userObject.IdmUser.Attributes["displayName"]);
            }
            callback(userObject);
        } else {
            PydioApi.getRestClient().getIdmApi().loadUser(userId).then(user => {
                if(!user){
                    errorCallback(new Error('Cannot find user'));
                    return;
                }
                userObject.setIdmUser(user);
                if(userObject.getAvatar() && userObject.getAvatar()){
                    userObject.setAvatar(UsersApi.buildUserAvatarUrl(userId, userObject.getAvatar()));
                } else {
                    UsersApi.avatarFromExternalProvider(userObject, callback);
                }
                callback(userObject);
            }).catch(e => {
                errorCallback(e);
            })
        }
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
            userObject.setAvatar(avatarUrl + '?' + pydio.user.getPreference('avatar'));
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

        if (UsersApi.avatarsCache[userObject.getId()] !== undefined){
            userObject.setAvatar(UsersApi.avatarsCache[userObject.getId()]);
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
            return PydioApi.getClient().getPydioObject().Parameters.get('ENDPOINT_REST_API') + '/frontend/binaries/USER/' + userId;
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

    /**
     *
     * @param userId string
     * @param idmUser {IdmUser}
     * @return {Promise<any>}
     */
    static getUserPromise(userId, idmUser){
        const namespace = 'user_public_data';
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
                let userObject;
                if(idmUser){
                    userObject = User.fromIdmUser(idmUser);
                } else {
                    userObject = new User(userId);
                }
                userObject.setLoading();
                cache.setKey(namespace, userId, userObject);

                UsersApi.loadPublicData(userObject, (result) => {
                    result.setLoaded();
                    cache.setKey(namespace, userId, result);
                    resolve(result);
                }, (error) => {
                    userObject.setLoaded();
                    userObject.setNotFound();
                    cache.setKey(namespace, userId, userObject);
                    reject(error);
                });
            }
        });
    }

}

UsersApi.avatarsCache = [];
UsersApi.avatarFromExternalProvider = debounce(UsersApi.avatarFromExternalProvider, 500);

export {User, UsersApi}