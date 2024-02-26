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

    static prepareIdmUser(idmUser, secondary=false) {
        let secondaryText;
        if(secondary) {
            const parts = []
            parts.push(Pydio.getMessages()[idmUser.Attributes && idmUser.Attributes['profile'] === 'shared' ? '589':'590'])
            if(idmUser.GroupPath !== '/') {
                parts.push(idmUser.GroupPath)
            }
            secondaryText = parts.join(' - ')
        }
        return {
            id: idmUser.Login,
            label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.Login,
            avatar: idmUser.Attributes && idmUser.Attributes["avatar"] ? idmUser.Attributes["avatar"] : undefined,
            type:'user',
            IdmUser: idmUser,
            secondaryText
        }
    }

    static prepareIdmGroup(idmUser, secondary=false) {
        let secondaryText
        if(secondary) {
            secondaryText = idmUser.GroupPath + idmUser.GroupLabel
        }
        return {
            id: idmUser.Uuid,
            label: idmUser.Attributes && idmUser.Attributes["displayName"] ? idmUser.Attributes["displayName"] : idmUser.GroupLabel,
            type:'group',
            icon: 'mdi mdi-account-multiple',
            secondaryText,
            IdmUser: idmUser
        }
    }

    static prepareTeam(team, secondary=false) {
        let secondaryText
        if(secondary) {
            secondaryText = Pydio.getMessages()['603']
        }
        return {
            id: team.Uuid,
            label: team.Label,
            type:'team',
            icon : 'mdi mdi-account-multiple-outline',
            itemsLoader : Loaders.loadTeamUsers,
            _notSelectable: true,
            secondaryText,
            IdmRole: team
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
                    ...Loaders.prepareTeam(team),
                    actions : actions
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
                    ...Loaders.prepareIdmGroup(idmUser),
                    childrenLoader:entry.childrenLoader ? Loaders.loadGroups : null,
                    itemsLoader: entry.itemsLoader ? Loaders.loadGroupUsers : null,
                    currentParams: (entry.currentParams && entry.currentParams.alpha_pages) ? {...entry.currentParams} : {}
                }
            });
            callback(items);
        });
    }

    static loadExternalUsers(entry, callback){
        let filter = '', offset = 0, limit = StdLimit, disableAW = false;
        if(entry.currentParams && entry.currentParams.alpha_pages){
            filter = entry.currentParams.value;
            disableAW = true
        }
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        const pydio = PydioApi.getClient().getPydioObject();
        IdmApi.listUsers('/', filter, true, offset, limit, 'shared', disableAW).then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.filter(idmUser => idmUser.Login !== pydio.user.id).map((idmUser) => {
                return {
                    _parent: entry,
                    ...Loaders.prepareIdmUser(idmUser),
                    external:true
                }
            });
            callback(items);
        });
    }

    static loadGroupUsers(entry, callback){
        let path = '/', filter = '', offset = 0, limit = StdLimit, disableAW = false;
        if(entry.IdmUser){
            path = LangUtils.trimRight(entry.IdmUser.GroupPath, '/') + '/' + entry.IdmUser.GroupLabel;
        }
        if(entry.currentParams && (entry.currentParams.alpha_pages || entry.currentParams.has_search)){
            filter = entry.currentParams.value;
            if(entry.currentParams.alpha_pages) {
                disableAW = true
            }
        }
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        const pydio = PydioApi.getClient().getPydioObject();
        IdmApi.listUsers(path, filter, false, offset, limit, '!shared', disableAW).then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.filter(idmUser => idmUser.Login !== pydio.user.id && idmUser.Login !== "pydio.anon.user").map((idmUser) => {
                return {
                    _parent: entry,
                    ...Loaders.prepareIdmUser(idmUser)
                }
            });
            callback(items);
        }) ;
    }

    static loadTeamUsers(entry, callback){
        let offset = 0, limit = StdLimit, filter = '', disableAW = false;
        if(entry.range){
            let [start, end] = entry.range.split('-');
            offset = parseInt(start);
            end = parseInt(end);
            limit = end - offset;
        }
        if(entry.currentParams && (entry.currentParams.alpha_pages || entry.currentParams.has_search)){
            filter = entry.currentParams.value;
            if(entry.currentParams.alpha_pages){
                disableAW = true
            }
        }
        IdmApi.listUsersWithRole(entry.IdmRole.Uuid, offset, limit, filter, disableAW).then(users => {
            entry.pagination = Loaders.computePagination(users);
            const items = users.Users.map((idmUser) => {
                return {
                    _parent: entry,
                    ...Loaders.prepareIdmUser(idmUser),
                }
            });
            callback(items);
        }) ;
    }

    static globalSearch(searchTerm, callback, offset=0, limit=50, externals=true, internals=true, teams=true) {

        searchTerm = '*'+searchTerm

        const pydio = PydioApi.getClient().getPydioObject();
        const proms = [];
        if(externals || internals) {
            const profile = (externals ? (internals ? '' : 'shared') : '!shared')
            const up = IdmApi.listUsers('/', searchTerm, true, offset, limit, profile).then(res => {
                return res.Users.filter(idmUser => idmUser.Login !== pydio.user.id && idmUser.Login !== "pydio.anon.user").map((idmUser) => {
                    return {
                        ...Loaders.prepareIdmUser(idmUser, true),
                        external:idmUser.Attributes && idmUser.Attributes['profile'] === 'shared'
                    }
                });
            }).then(uu => {return {users: uu}});
            proms.push(up)

            const gp = IdmApi.listGroups('/', searchTerm, true, offset, limit).then(res => {
                return res.Groups.map(idmGroup => {
                    return {
                        ...Loaders.prepareIdmGroup(idmGroup, true),
                        childrenLoader:Loaders.loadGroups,
                        itemsLoader:Loaders.loadGroupUsers,
                    }
                })
            }).then(gg => {return {groups: gg}})
            proms.push(gp)
        }
        if(teams) {
            const tp = IdmApi.listTeams(searchTerm, offset, limit).then(collection => {
                return collection.Teams.map(team => {
                    return {
                        ...Loaders.prepareTeam(team, true)
                    };
                });
            }).then(tt => {return {teams: tt}})
            proms.push(tp)
        }

        return Promise.all(proms).then(results => {
            const all = results.reduce((p,v) => {return {...p, ...v}}, {})
            callback(all)
            return all
        })
    }

}

export {Loaders as default}