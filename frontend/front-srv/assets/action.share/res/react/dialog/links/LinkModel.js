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

import PydioApi from 'pydio/http/api'
import Observable from 'pydio/lang/observable'
import ShareHelper from '../main/ShareHelper'
import {ShareServiceApi, RestPutShareLinkRequest, RestShareLink, RestShareLinkAccessType} from 'pydio/http/rest-api'
import PassUtils from 'pydio/util/pass'

class LinkModel extends Observable {

    dirty;

    constructor(){
        super();
        this.link = new RestShareLink();
        this.link.Permissions = [
            RestShareLinkAccessType.constructFromObject("Preview"),
            RestShareLinkAccessType.constructFromObject("Download")
        ];
        this.link.Policies = [];
        this.link.PoliciesContextEditable = true;
        this.link.RootNodes = [];
        this.ValidPassword = true;
    }

    isEditable(){
        return this.link.PoliciesContextEditable;
    }

    isDirty(){
        return this.dirty;
    }

    getLinkUuid() {
        return this.link.Uuid;
    }

    /**
     * @return {RestShareLink}
     */
    getLink(){
        return this.link;
    }

    /**
     * @return {String}
     */
    getPublicUrl(){
        return ShareHelper.buildPublicUrl(pydio, this.link.LinkHash);
    }

    /**
     * @param link {RestShareLink}
     */
    updateLink(link) {
        this.link = link;
        this.notifyDirty();
    }

    notifyDirty(){
        this.dirty = true;
        this.notify('update');
    }

    revertChanges(){
        if(this.originalLink){
            this.link = this.clone(this.originalLink);
            this.dirty = false;
            this.updatePassword = this.createPassword = null;
            this.ValidPassword = true;
            this.notify('update');
        }
    }

    hasPermission(permissionValue){
        return this.link.Permissions.filter((perm)=>{
            return (perm === permissionValue);
        }).length > 0;
    }

    isExpired(){
        if(this.link.MaxDownloads && parseInt(this.link.CurrentDownloads) >= parseInt(this.link.MaxDownloads)){
            return true;
        }
        if(this.link.AccessEnd){
            // TODO
        }
        return false;
    }

    /**
     *
     * @param uuid string
     * @return {Promise.<RestShareLink>}
     */
    load(uuid) {
        const api = new ShareServiceApi(PydioApi.getRestClient());
        return api.getShareLink(uuid).then(result => {
            this.link = result;
            if(!this.link.Permissions) {
                this.link.Permissions = [];
            }
            if(!this.link.Policies) {
                this.link.Policies = [];
            }
            if(!this.link.RootNodes) {
                this.link.RootNodes = [];
            }
            this.originalLink = this.clone(this.link);
            this.notify("update");
        })
    }

    setCreatePassword(password){
        if(password){
            PassUtils.checkPasswordStrength(password, (ok, msg) =>{
                this.ValidPassword = ok;
                this.ValidPasswordMessage = msg;
            })
        } else {
            this.ValidPassword = true;
        }
        this.createPassword = password;
        this.link.PasswordRequired = true;
        this.notifyDirty();
    }

    setUpdatePassword(password){
        if(password){
            PassUtils.checkPasswordStrength(password, (ok, msg) =>{
                this.ValidPassword = ok;
                this.ValidPasswordMessage = msg;
            })
        } else {
            this.ValidPassword = true;
        }
        this.updatePassword = password;
        this.notifyDirty();
    }

    setCustomLink(newLink){
        this.customLink = newLink;
    }

    /**
     *
     * @return {*|Promise.<RestShareLink>}
     */
    save() {
        if(!this.ValidPassword){
            throw new Error(this.ValidPasswordMessage);
        }
        const api = new ShareServiceApi(PydioApi.getRestClient());
        let request = new RestPutShareLinkRequest();
        if(this.createPassword){
            request.PasswordEnabled = true;
            request.CreatePassword = this.createPassword;
        } else if(this.updatePassword){
            request.PasswordEnabled = true;
            if(!this.link.PasswordRequired){
                request.CreatePassword = this.updatePassword;
            } else {
                request.UpdatePassword = this.updatePassword;
            }
        }
        if (ShareHelper.getAuthorizations(pydio).password_mandatory && !request.PasswordEnabled){
            throw new Error('You cannot disable passowrd on this link');
        }
        if(this.customLink && this.customLink !== this.link.LinkHash){
            request.UpdateCustomHash = this.customLink;
        }
        request.ShareLink = this.link;
        return api.putShareLink(request).then(result => {
            this.link = result;
            this.dirty = false;
            this.originalLink = this.clone(this.link);
            this.updatePassword = this.createPassword = this.customLink = null;
            this.ValidPassword = true;
            this.notify('update');
            this.notify('save');
        });
    }

    /**
     *
     * @return {*|Promise.<RestShareLink>}
     */
    deleteLink(emptyLink){
        const api = new ShareServiceApi(PydioApi.getRestClient());
        return api.deleteShareLink(this.link.Uuid).then(result => {
            this.link = emptyLink;
            this.dirty = false;
            this.updatePassword = this.createPassword = this.customLink = null;
            this.notify('update');
        });
    }

    /**
     * @param link {RestShareLink}
     */
    clone(link){
        return RestShareLink.constructFromObject(JSON.parse(JSON.stringify(link)));
    }

}

export {LinkModel as default}