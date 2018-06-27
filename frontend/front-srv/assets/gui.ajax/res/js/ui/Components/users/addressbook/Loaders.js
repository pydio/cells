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

    static listUsers(params, callback, parent = null){
        let baseParams = {get_action:'user_list_authorized_users',format:'json'};
        baseParams = {...baseParams, ...params};
        let cb = callback;
        if(parent){
            if(parent.range){
                baseParams['range'] = parent.range;
            }
            cb = (children) => {
                callback(children.map(function(c){ c._parent = parent; return c; }));
            };
        }
        PydioApi.getClient().request(baseParams, function(transport){
            cb(transport.responseJSON);
            const cRange = transport.responseObject.headers.get('Content-Range');
            const aRange = transport.responseObject.headers.get('Accept-Range');
            if(cRange && aRange && parent){
                const [type, interval] = aRange.split(' ');
                const [range, max] = cRange.split('/');
                const [start, end] = range.split('-');
                parent.pagination = {
                    start: parseInt(start),
                    end: parseInt(end),
                    max: parseInt(max),
                    interval: parseInt(interval)
                };
            }
        });
    }

    static loadTeams(entry, callback){
        const wrapped = (children) => {
            children.map(function(child){
                child.icon = 'mdi mdi-account-multiple-outline';
                child.itemsLoader = Loaders.loadTeamUsers;
                child.actions = {
                    type    :'team',
                    /*create  :'573',*/
                    remove  :'574',
                    multiple: true
                };
                child._notSelectable=true;
            });
            callback(children);
        };
        Loaders.listUsers({filter_value:8}, wrapped, entry);
    }

    static loadGroups(entry, callback){
        const wrapped = (children) => {
            children.map(function(child){
                child.icon = 'mdi mdi-account-multiple';
                child.childrenLoader = entry.childrenLoader ? Loaders.loadGroups : null;
                child.itemsLoader = entry.itemsLoader ? Loaders.loadGroupUsers : null;
                if(entry.currentParams && entry.currentParams.alpha_pages){
                    child.currentParams = {...entry.currentParams};
                }
            });
            callback(children);
        };
        const path = entry.id.replace('PYDIO_GRP_', '');
        let params = {filter_value:4, group_path:path};
        if(entry.currentParams && !entry.currentParams.alpha_pages){
            params = {...params, ...entry.currentParams};
        }
        Loaders.listUsers(params, wrapped, entry);
    }

    static loadExternalUsers(entry, callback){
        Loaders.listUsers({filter_value:2}, callback, entry);
    }

    static loadGroupUsers(entry, callback){
        const path = entry.id.replace('PYDIO_GRP_', '');
        let params = {filter_value:1, group_path:path};
        if(entry.currentParams){
            params = {...params, ...entry.currentParams};
        }
        Loaders.listUsers(params, callback, entry);
    }

    static loadTeamUsers(entry, callback){
        Loaders.listUsers({filter_value:3, group_path:entry.id}, callback, entry);
    }

}

export {Loaders as default}