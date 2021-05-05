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
import Pydio from 'pydio';
import PydioApi from 'pydio/http/api';
import LangUtils from 'pydio/util/lang';
const IdmApi = PydioApi.getRestClient().getIdmApi();

const StdLimit = 50;

class Loaders{

    static childrenAsPromise(item, leaf = false){

        const {childrenLoader, itemsLoader, leafLoaded, collectionsLoaded, leafs, collections} = item;
        let loader = leaf ? itemsLoader : childrenLoader;
        let loaded = leaf ? leafLoaded : collectionsLoaded;
        return new Promise((resolve, reject) => {
            if(!loaded && loader){
                loader(item, (newChildren)=>{
                    if(leaf) {
                        item.leafs = newChildren;
                        item.leafLoaded = true;
                    }else {
                        item.collections = newChildren;
                        item.collectionsLoaded = true;
                    }
                    resolve(newChildren);
                });
            }else{
                const res = ( leaf ? leafs : collections ) || [];
                resolve(res);
            }
        });

    }

    static computePagination(result){
        let count;
        if(result.Users) {
            count = result.Users.length;
        } else if(result.Groups) {
            count = result.Groups.length;
        } else if(result.Teams) {
            count = result.Teams.length;
        }
        if(result.Total > count){
            return {
                start: result.Offset,
                end: result.Offset + result.Limit,
                max: result.Total,
                interval: result.Limit
            }
        }else {
            return null;
        }
    }

    static loadTeams(entry, callback){
        let offset = 0, limit = StdLimit; // Roles API does not provide pagination info !
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        let actions = {};
        if (Pydio.getInstance().getController().actions.has('user_team_create')){
            actions = {
                type    :'team',
                remove  :'574',
                multiple: true
            };
        }
        IdmApi.listTeams('', offset, limit).then(collection => {
            entry.pagination = Loaders.computePagination(collection);
            const items = collection.Teams.map(team => {
                return {
                    _parent: entry,
                    id: team.Uuid,
                    label: team.Label,
                    type:'team',
                    icon : 'mdi mdi-account-multiple-outline',
                    itemsLoader : Loaders.loadTeamUsers,
                    actions : actions,
                    _notSelectable: true,
                    IdmRole: team
                };
            });
            callback(items);
        });
    }

    static loadGroups(entry, callback){
        let path = '/', filter = '';
        if(entry.IdmUser){
            path = LangUtils.trimRight(entry.IdmUser.GroupPath, '/') + '/' + entry.IdmUser.GroupLabel;
        }
        if(entry.currentParams && entry.currentParams.has_search){
            filter = entry.currentParams.value;
        }

        IdmApi.listGroups(path, filter, false, 0, 1000).then(groups => {
            const items = groups.Groups.map(idmUser => {
                return {
                    _parent: entry,
                    id: idmUser.Uuid,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.GroupLabel,
                    type:'group',
                    icon: 'mdi mdi-account-multiple',
                    childrenLoader:entry.childrenLoader ? Loaders.loadGroups : null,
                    itemsLoader: entry.itemsLoader ? Loaders.loadGroupUsers : null,
                    currentParams: (entry.currentParams && entry.currentParams.alpha_pages) ? {...entry.currentParams} : {},
                    IdmUser: idmUser
                }
            });
            callback(items);
        });
    }

    static loadExternalUsers(entry, callback){
        let filter = '', offset = 0, limit = StdLimit;
        if(entry.currentParams && entry.currentParams.alpha_pages){
            filter = entry.currentParams.value;
        }
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        const pydio = PydioApi.getClient().getPydioObject();
        IdmApi.listUsers('/', filter, true, offset, limit, 'shared').then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.filter(idmUser => idmUser.Login !== pydio.user.id).map((idmUser) => {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    avatar: idmUser.Attributes && idmUser.Attributes["avatar"] ? idmUser.Attributes["avatar"] : undefined,
                    type:'user',
                    external:true,
                    IdmUser: idmUser
                }
            });
            callback(items);
        });
    }

    static loadGroupUsers(entry, callback){
        let path = '/', filter = '', offset = 0, limit = StdLimit;
        if(entry.IdmUser){
            path = LangUtils.trimRight(entry.IdmUser.GroupPath, '/') + '/' + entry.IdmUser.GroupLabel;
        }
        if(entry.currentParams && (entry.currentParams.alpha_pages || entry.currentParams.has_search)){
            filter = entry.currentParams.value;
        }
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        const pydio = PydioApi.getClient().getPydioObject();
        IdmApi.listUsers(path, filter, false, offset, limit, '!shared').then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.filter(idmUser => idmUser.Login !== pydio.user.id && idmUser.Login !== "pydio.anon.user").map((idmUser) => {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    avatar: idmUser.Attributes && idmUser.Attributes["avatar"] ? idmUser.Attributes["avatar"] : undefined,
                    type:'user',
                    IdmUser: idmUser
                }
            });
            callback(items);
        }) ;
    }

    static loadTeamUsers(entry, callback){
        let offset = 0, limit = StdLimit, filter = '';
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        if(entry.currentParams && (entry.currentParams.alpha_pages || entry.currentParams.has_search)){
            filter = entry.currentParams.value;
        }
        IdmApi.listUsersWithRole(entry.IdmRole.Uuid, offset, limit, filter).then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.map((idmUser) => {
                return {
                    _parent: entry,
                    id: idmUser.Login,
                    label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
                    type:'user',
                    IdmUser: idmUser
                }
            });
            callback(items);
        }) ;
    }

}

export {Loaders as default}