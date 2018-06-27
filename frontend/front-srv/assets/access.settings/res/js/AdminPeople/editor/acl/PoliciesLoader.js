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

import PydioApi from 'pydio/http/api';
import Observable from 'pydio/lang/observable';
import {PolicyServiceApi, IdmListPolicyGroupsRequest} from 'pydio/http/rest-api';

class PoliciesLoader extends Observable {

    constructor(){
        super();
        this._loading = false;
        this._loaded = false;
        this._policies = [];
    }

    load() {

        this._loading = true;
        const api = new PolicyServiceApi(PydioApi.getRestClient());
        api.listPolicies(new IdmListPolicyGroupsRequest()).then((data) => {
            this._policies = [];
            if(data.PolicyGroups) {
                data.PolicyGroups.map((pGroup) => {
                    if(pGroup.ResourceGroup === "acl"){
                        this._policies.push({id:pGroup.Uuid, label: pGroup.Name});
                    }
                });
            }
            this._loaded = true;
            this._loading = false;
            this.notify('loaded');
        });

    }

    static getInstance() {
        if (!PoliciesLoader.INSTANCE) {
            PoliciesLoader.INSTANCE = new PoliciesLoader();
        }
        return PoliciesLoader.INSTANCE;
    }

    /**
     * @return Promise
     */
    getPolicies() {

        return new Promise((resolve, reject) => {

            if(this._loaded) {

                resolve(this._policies);

            } else {

                this.observeOnce('loaded', () => {
                    resolve(this._policies);
                });
                if(!this._loading){
                    this.load();
                }

            }

        });

    }

}

PoliciesLoader.INSTANCE = null;

export {PoliciesLoader as default};