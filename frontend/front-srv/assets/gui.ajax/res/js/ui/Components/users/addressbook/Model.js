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
    }

    getRoot() {
        return this.root
    }

    contextItem() {
        return this.selectedItem
    }

    setContext(item, callback) {

        // Special case for teams
        if(this.mode === 'selector' && item.IdmRole && item.IdmRole.IsTeam){
            this.leafItemClicked(item);
            return;
        }

        this.loading = true;
        this.notify('update')

        Loaders.childrenAsPromise(item, false).then(() => {
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
            return;
        }
        this.selectedItem.leafLoaded = false;
        this.selectedItem.collectionsLoaded = false;
        this.setContext(this.selectedItem, () => {
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
        const authConfigs = this.pydio.getPluginConfigs('core.auth');
        this._teamsEditable = this.pydio.getController().actions.has("user_team_create");

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
                id: 'teams',
                label: this.m(568),
                childrenLoader: Loaders.loadTeams,
                _parent: null,
                _notSelectable: true,
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
        if(this.usersFrom !== 'remote'){
            if(authConfigs.get('USER_CREATE_USERS')){
                this.root.collections.push({
                    id:'ext',
                    label:this.m(593),
                    icon:'mdi mdi-account-network',
                    itemsLoader: Loaders.loadExternalUsers,
                    _parent:this.root,
                    _notSelectable:true,
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
                    id: 'teams',
                    label: this.m(568),
                    icon: 'mdi mdi-account-multiple',
                    childrenLoader: Loaders.loadTeams,
                    _parent: this.root,
                    _notSelectable: true,
                    actions: teamActions
                });
            }
            this.root.collections.push({
                id:'PYDIO_GRP_/',
                label:this.m(584),
                icon:'mdi mdi-account-box',
                childrenLoader: Loaders.loadGroups,
                itemsLoader:  Loaders.loadGroupUsers,
                _parent:this.root,
                _notSelectable:true
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
    
    m(id){
        return this.pydio.MessageHash[id] || id
    }
    

}

export default Model