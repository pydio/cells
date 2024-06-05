/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import Pydio from 'pydio'
import Observable from 'pydio/lang/observable'
import Loaders from './Loaders'
import PydioApi from 'pydio/http/api';
import {User} from 'pydio/http/users-api';
import {debounce} from 'lodash'

const globalSearchDebounced = debounce(Loaders.globalSearch, 350)

class Model extends Observable {

    pydio = null
    mode = 'book'
    teamsOnly = false
    usersOnly = false
    usersFrom = 'local'
    loading = false
    root = null
    selectedItem = null
    rightPanelItem = null
    onItemSelected=null
    pendingCreateItem=null

    searchTerm=''
    searchMode=false
    searchItem=null

    selectionMode=false
    multipleSelection=[]
    
    constructor(pydio, mode, usersOnly=false, usersFrom='local', teamsOnly = false, onItemSelected=null) {
        super();
        this.pydio = pydio;
        this.mode = mode;
        this.teamsOnly = teamsOnly;
        this.usersOnly = usersOnly;
        this.usersFrom = usersFrom;
        this.onItemSelected = onItemSelected;

        const authConfigs = this.pydio.getPluginConfigs('core.auth');
        this._teamsEditable = this.pydio.getController().actions.has("user_team_create");
        this._externalsAllowed = authConfigs.get('USER_CREATE_USERS')
    }

    getRoot() {
        if(this.searchMode && this.searchItem) {
            return this.searchItem
        }
        return this.root
    }

    contextItem() {
        return this.selectedItem
    }

    setContext(item, callback) {

        // Special case for teams
        if(this.mode === 'selector' && item.IdmRole && item.IdmRole.IsTeam){
            this.leafItemClicked(item);
            return Promise.resolve();
        }

        this.loading = true;
        this.notify('update')

        return Loaders.childrenAsPromise(item, false).then(() => {
            Loaders.childrenAsPromise(item, true).then(() => {
                this.selectedItem = item;
                this.loading = false;
                this.notify('update')
            }).then(()=>{
                if(callback){
                    callback()
                }
            });
        });
    }

    contextIsGroup() {
        return this.selectedItem && ( (this.selectedItem.IdmUser && this.selectedItem.IdmUser.IsGroup) || this.selectedItem.id === 'PYDIO_GRP_/' )
    }

    contextIsTeam() {
        return this.selectedItem && this.selectedItem.IdmRole && this.selectedItem.IdmRole.IsTeam
    }

    reloadContext() {
        if(!this.selectedItem) {
            return Promise.resolve;
        }
        this.selectedItem.leafLoaded = false;
        this.selectedItem.collectionsLoaded = false;
        return this.setContext(this.selectedItem, () => {
            if(this.rightPanelItem){
                const rPaneId = this.rightPanelItem.id;
                let foundItem = null;
                const leafs = this.selectedItem.leafs || [];
                const collections = this.selectedItem.collections || [];
                [...leafs, ...collections].forEach((leaf) => {
                    if(leaf.id === rPaneId) {
                        foundItem = leaf;
                    }
                });
                this.rightPanelItem = foundItem
                this.notify('update')
            }
        })
    }

    reloadCurrentAtPage = (letterOrRange) => {
        const item = this.selectedItem;
        item.leafLoaded = false;
        item.collectionsLoaded = false;
        if(letterOrRange === -1) {
            item.currentParams = null;
        }else if(letterOrRange.indexOf('-') !== -1){
            item.range = letterOrRange;
        }else{
            item.range = null;
            item.currentParams = {alpha_pages:'true', value:letterOrRange};
        }
        this.setContext(item);
    };

    reloadCurrentWithSearch = (value) => {
        if(!value){
            this.reloadCurrentAtPage(-1);
            return;
        }
        const item = this.selectedItem;

        item.leafLoaded = false;
        item.collectionsLoaded = false;
        item.currentParams = {has_search: true, value:value, existing_only:true};
        this.setContext(item);
    };

    setGlobalSearch(enable, term) {
        if(enable !== this.searchMode) {
            if(enable) {
                if(!this.searchItem) {
                    this.searchItem = {
                        id:'search',
                        label:this.m('583'),
                        type:'root'
                    }
                }
                this.savedContext = this.contextItem()
                this.searchItem.collections = []
                this.setContext(this.searchItem)
            } else {
                this.searchItem.collections = []
                this.setContext(this.savedContext)
            }
        }
        this.searchMode = enable
        this.searchTerm = term
        if(this.searchTerm) {
            globalSearchDebounced(term, (res)=> {
                this.searchItem.collections = []
                const topFolders = this.prepareTopFolders(this.searchItem)
                let exts, ints
                if(res.users) {
                    exts = res.users.filter(u => u.external)
                    ints = res.users.filter(u => !u.external)
                }
                if(exts !== undefined){
                    this.searchItem.collections.push({
                        ...topFolders.shared,
                        leafs:exts
                    })
                }
                if(res.teams) {
                    this.searchItem.collections.push({
                        ...topFolders.teams,
                        collections: res.teams
                    })
                }
                if(ints !== undefined || res.groups) {
                    const count = (ints && ints.length ||0) + (res.groups && res.groups.length ||0)
                    this.searchItem.collections.push({
                        ...topFolders.directory,
                        collections:res.groups,
                        leafs:ints
                    })
                }
                // Re-Attach all to "All Results" node
                const all = {...topFolders.results}
                this.searchItem.collections.forEach(c => {
                    all.collections.push(...c.collections.map(r => {
                        r._parent = c
                        return {...r, _parent:all}
                    }))
                    all.leafs.push(...c.leafs.map(r => {
                        r._parent = c
                        return {...r, _parent:all}
                    }))
                    c.notExpandable = true
                    c.label+=` (${c.collections.length+c.leafs.length})`
                })
                all.label += ` (${all.collections.length+all.leafs.length})`
                this.searchItem.collections.unshift(all)
                this.setContext(all)
                this.notify('update')
            }, 0, 50, this._externalsAllowed)
        }
        this.notify('update')
    }

    getSearchStatus() {
        return {
            searchMode: this.searchMode,
            searchTerm: this.searchTerm
        }
    }

    rightItem() {
        return this.rightPanelItem
    }

    leafItemClicked(item) {
        if(this.onItemSelected) {
            const uObject = new User(
                item.id,
                item.label,
                item.type,
                item.group,
                item.avatar,
                item.temporary,
                item.external
            );
            if(item.trusted_server_id) {
                uObject.trustedServerId = item.trusted_server_id;
                uObject.trustedServerLabel = item.trusted_server_label;
            }
            uObject._uuid = item.uuid;
            if(item.IdmUser) {
                uObject.IdmUser = item.IdmUser;
            }
            if(item.IdmRole) {
                uObject.IdmRole = item.IdmRole;
            }
            this.onItemSelected(uObject);
            return
        }

        this.rightPanelItem = item
        this.notify('update')
    }

    clearRightItem() {
        this.rightPanelItem = null;
        this.notify('update')
    }

    teamsEditable() {
        return this._teamsEditable
    }

    deleteMultipleSelection() {
        this.selectionMode = false
        this.deleteItems(this.selectedItem, this.multipleSelection)
    }

    deleteItems = (parentItem, selection, skipConfirm = false) => {
        if(!skipConfirm && !confirm(this.m(278))){
            return;
        }
        switch(parentItem.actions.type){
            case 'users':
                Promise.all(selection.map((user) => {
                    if(this.rightPanelItem === user) {
                        this.rightPanelItem = null
                    }
                    return PydioApi.getRestClient().getIdmApi().deleteIdmUser(user.IdmUser);
                })).then(() => {
                    this.reloadContext();
                });
                break;
            case 'teams':
                Promise.all(selection.map((team)=>{
                    if(this.rightPanelItem === team) {
                        this.rightPanelItem = null
                    }
                    return PydioApi.getRestClient().getIdmApi().deleteRole(team.IdmRole.Uuid);
                })).then(() => {
                    this.reloadContext();
                });
                break;
            case 'team':
                Promise.all(selection.map((user) => {
                    return PydioApi.getRestClient().getIdmApi().removeUserFromTeam(parentItem.IdmRole.Uuid, user.IdmUser.Login);
                })).then(()=>{
                    this.reloadContext();
                });
                break;
            default:
                break;
        }
    };

    setCreateItem() {
        this.pendingCreateItem = this.selectedItem
        this.notify('update')
    }

    clearCreateItem() {
        this.pendingCreateItem = null
        this.notify('update')
    }

    createItem(){
        return this.pendingCreateItem
    }

    setSelectionMode(mode = undefined) {
        if(mode === undefined) {
            this.selectionMode = !this.selectionMode
        } else {
            this.selectionMode = mode
        }
        this.multipleSelection = []
        this.notify('update')
    }

    getSelectionMode() {
        return this.selectionMode
    }

    setMultipleSelection(s) {
        this.multipleSelection = s
        this.notify('update')
    }

    getMultipleSelection() {
        return this.multipleSelection
    }

    initTree() {
        let teamActions = {};
        if(this._teamsEditable) {
            teamActions = {
                type: 'teams',
                create: '+ ' + this.m(569),
                remove: this.m(570),
                multiple: true
            };
        }

        if(this.teamsOnly){
            this.root = {
                ...this.prepareTopFolders(null).teams,
                childrenLoader: Loaders.loadTeams,
                actions: teamActions
            };
            this.selectedItem = this.root
            return;
        }

        this.root = {
            id:'root',
            label:this.m(592),
            type:'root',
            collections: []
        };
        const topFolders = this.prepareTopFolders(this.root)

        if(this.usersFrom !== 'remote'){
            if(this._externalsAllowed){
                this.root.collections.push({
                    ...topFolders.shared,
                    itemsLoader: Loaders.loadExternalUsers,
                    actions:{
                        type    : 'users',
                        create  : '+ ' + this.m(484),
                        remove  : this.m(582),
                        multiple: true
                    }
                });
            }
            if(!this.usersOnly) {
                this.root.collections.push({
                    ...topFolders.teams,
                    childrenLoader: Loaders.loadTeams,
                    actions: teamActions
                });
            }
            this.root.collections.push({
                ...topFolders.directory,
                childrenLoader: Loaders.loadGroups,
                itemsLoader:  Loaders.loadGroupUsers,
            });
        }

        /*
        const ocsRemotes = this.pydio.getPluginConfigs('core.ocs').get('TRUSTED_SERVERS');
        if(ocsRemotes && !this.usersOnly && this.usersFrom !== 'local'){
            let remotes = JSON.parse(ocsRemotes);
            let remotesNodes = {
                id:'remotes',
                label:this.m(594),
                //icon:'mdi mdi-server',
                collections:[],
                _parent:root,
                _notSelectable:true
            };
            for(let k in remotes){
                if(!remotes.hasOwnProperty(k)) continue;
                remotesNodes.collections.push({
                    id:k,
                    label:remotes[k],
                    icon:'mdi mdi-server-network',
                    type:'remote',
                    _parent:remotesNodes,
                    _notSelectable:true
                });
            }
            if(remotesNodes.collections.length){
                root.collections.push(remotesNodes);
            }
        }
        */

        this.selectedItem = this.mode === 'selector' ? this.root : this.root.collections[0]

    }

    prepareTopFolders(parent) {
        return {
            'shared':{
                id:'ext',
                label:this.m(593),
                icon:'mdi mdi-account-network',
                _parent:parent,
                _notSelectable:true,
                collections:[],
                leafs:[]
            },
            'teams':{
                id: 'teams',
                label: this.m(568),
                icon: 'mdi mdi-account-multiple',
                _parent: parent,
                _notSelectable: true,
                collections:[],
                leafs:[]
            },
            'directory':{
                id:'PYDIO_GRP_/',
                label:this.m(584),
                icon:'mdi mdi-account-box',
                _parent:parent,
                _notSelectable:true,
                collections:[],
                leafs:[]
            },
            'results':{
                id:'results',
                label: this.m('599-a'),
                icon:'mdi mdi-magnify',
                _parent: parent,
                notExpandable:true,
                collections: [],
                leafs: []
            }
        }
    }

    m(id){
        return this.pydio.MessageHash[id] || id
    }
    

}

export default Model