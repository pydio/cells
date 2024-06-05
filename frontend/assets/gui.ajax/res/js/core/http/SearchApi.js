/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import MetaNodeProvider from '../model/MetaNodeProvider'
import {SearchServiceApi, TreeSearchRequest, TreeQuery} from 'cells-sdk'

class SearchApi {

    constructor(pydio){
        this.api = new SearchServiceApi(PydioApi.getRestClient());
        this.pydio = pydio;
    }

    search(values, scope, limit, minimalStats = false, sortField = '', sortDesc = false){


        let query = new TreeQuery();
        if(scope !== 'all'){
            query.PathPrefix = [scope];
        }
        //console.log(values);
        const keys = Object.keys(values);
        if (keys.length === 1 && keys[0] === 'basename') {
            query.FileName = this.autoQuote(values['basename']);
        } else {
            let freeQueries = {};
            keys.map(k => {
                const value = values[k];
                if(k.indexOf('ajxp_meta_') === 0) {
                    let sK = k.replace('ajxp_meta_', '')
                    if (sK !== 'TextContent') {
                        sK = 'Meta.' + sK;
                    }
                    freeQueries[sK] = this.autoQuote(value);
                } else if (k === 'ajxp_mime') {
                    if(value === 'ajxp_folder') {
                        query.Type = 'COLLECTION';
                    } else if(value.indexOf('mimes:') === 0) {
                        query.Type = 'LEAF';
                        freeQueries['Meta.mime'] = value.replace('mimes:', '')
                    } else {
                        query.Type = 'LEAF';
                        if(value !== 'ajxp_file'){
                            query.Extension = value;
                        }
                    }
                } else if(k === 'basename') {
                    freeQueries['Basename'] = this.autoQuote(value);
                } else if(k === 'basenameOrContent'){
                    query.FileNameOrContent = this.autoQuote(value);
                } else if(k === 'Content'){
                    query.Content = this.autoQuote(value);
                } else if(k === 'ajxp_modiftime' && value && (value['from'] !== undefined || value['to'] !== undefined)){
                    if(value['from']){
                        query.MinDate = Math.floor(value['from'] / 1000) + '';
                    }
                    if(value['to']){
                        query.MaxDate = Math.floor(value['to'] / 1000) + '';
                    }
                } else if(k === 'ajxp_bytesize' && value && (value['from'] !== undefined || value['to'] !== undefined)){
                    if(parseInt(value['from']) > 0){
                        query.MinSize = value['from'] + '';
                    }
                    if(parseInt(value['to']) > 0 && parseInt(value['to']) < 1099511627776){
                        query.MaxSize = value['to'] + '';
                    }
                }
            });
            if(Object.keys(freeQueries).length){
                query.FreeString = Object.keys(freeQueries).map(k =>{
                    let val = freeQueries[k]
                    if(val === true) {
                        val = 'T*';
                    } else if(val.indexOf && val.indexOf('|') > -1){ // test indexOf
                        return val.split('|').map(v => k+':'+v).join(' ')
                    }
                    return "+" + k + ":" + val;
                }).join(" ");
            }
        }

        let request = new TreeSearchRequest();
        request.Query = query;
        request.Size = limit;
        if(minimalStats) {
            request.StatFlags = [4];
        }
        request.SortField = sortField
        request.SortDirDesc = sortDesc;

        return this.searchRequest(request);
    }

    autoQuote(text){
        if (typeof text === "string" && text.indexOf(" ") > -1){
            return "\"" + text + "\"";
        }
        return text;
    }

    // Search a node by its UUID
    searchByUUID(nodeUUID, minimalStats=true) {
        let query = new TreeQuery();
        query.UUIDs = [nodeUUID];
        let request = new TreeSearchRequest();
        request.Query = query;
        if(minimalStats) {
            request.StatFlags = [4];
        }
        return this.searchRequest(request)
    }

    searchRequest(request) {
        const defaultSlug = this.pydio.user.getActiveRepositoryObject().getSlug();
        return this.api.nodes(request).then(response => {
            if(!response.Results){
                return {Results: [], Total: 0}
            }
            response.Results = response.Results.map(n => {
                return MetaNodeProvider.parseTreeNode(n, '', defaultSlug);
            });
            return response;
        })
    }

}

export {SearchApi as default}