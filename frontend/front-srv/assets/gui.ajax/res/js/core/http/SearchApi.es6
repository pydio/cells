import PydioApi from './PydioApi'
import MetaNodeProvider from '../model/MetaNodeProvider'
import SearchServiceApi from './gen/api/SearchServiceApi'
import TreeSearchRequest from './gen/model/TreeSearchRequest'
import TreeQuery from './gen/model/TreeQuery'

class SearchApi {

    constructor(pydio){
        this.api = new SearchServiceApi(PydioApi.getRestClient());
        this.pydio = pydio;
    }

    search(values, scope, limit){


        let query = new TreeQuery();
        const prefix = this.computePathPrefix(scope);
        if(prefix){
            query.PathPrefix = [prefix];
        }

        const keys = Object.keys(values);
        if (keys.length === 1 && keys[0] === 'basename') {
            query.FileName = this.autoQuote(values['basename']);
        } else {
            let freeQueries = {};
            keys.map(k => {
                const value = values[k];
                if(k.indexOf('ajxp_meta_') === 0) {
                    freeQueries["Meta." + k.replace('ajxp_meta_', '')] = this.autoQuote(value);
                } else if (k === 'ajxp_mime') {
                    if(value === 'ajxp_folder'){
                        query.Type = 'COLLECTION';
                    } else {
                        query.Type = 'LEAF';
                        query.Extension = value;
                    }
                } else if(k === 'basename'){
                    freeQueries['Basename'] = this.autoQuote(value);
                } else if(k === 'ajxp_modiftime' && value && value['from'] !== undefined && value['to'] !== undefined ){
                    query.MinDate = Math.floor(value['from'] / 1000) + '';
                    query.MaxDate = Math.floor(value['to'] / 1000) + '';
                } else if(k === 'ajxp_bytesize' && value && value['from'] !== undefined && value['to'] !== undefined){
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
                    return "+" + k + ":" + freeQueries[k];
                }).join(" ");
            }
        }

        let request = new TreeSearchRequest();
        request.Query = query;
        request.Size = limit;

        const defaultSlug = this.pydio.user.getActiveRepositoryObject().getSlug();
        return new Promise((resolve, reject) => {
            this.api.nodes(request).then(response => {
                if(!response.Results){
                    resolve([]);
                }
                const nodes = response.Results.map(n => {
                    return MetaNodeProvider.parseTreeNode(n, '', defaultSlug);
                });
                resolve(nodes);

            }).catch((e) => {
                reject(e);
            })
        });

    }

    computePathPrefix(scope){
        const slug = this.pydio.user.getActiveRepositoryObject().getSlug();
        switch (scope){
            case 'all':
                // All workspaces
                return '';
            case 'ws':
                // Current workspace
                return slug + '/';
            case 'folder':
            default:
                // Current folder
                return slug + this.pydio.getContextHolder().getContextNode().getPath();
        }
    }

    autoQuote(text){
        if (typeof text === "string" && text.indexOf(" ") > -1){
            return "\"" + text + "\"";
        }
        return text;
    }

}

export {SearchApi as default}