import {ProvisioningApi} from 'pydio-sdk-js'
import LangUtils from 'pydio/util/lang'
import Observable from 'pydio/lang/observable'
import PydioApi from 'pydio/http/api';
import {ConfigServiceApi, ObjectDataSource, WorkspaceServiceApi, RestSearchWorkspaceRequest, IdmWorkspaceSingleQuery, IdmWorkspaceScope} from 'cells-sdk';


class Loader extends Observable {

    /**
     * Load workspaces from Pydio 8 instance.
     * This instance must have CORS enabled ! See github.com/pydio/pydio-core branch #test-cors
     * @return {Promise<any>}
     */
    loadWorkspaces(url, user, pwd){

        const api = new ProvisioningApi();
        api.apiClient.basePath = LangUtils.trimRight(url, '/') + "/api/v2";
        api.apiClient.authentications = {
            "basicAuth":{type:'basic', username:user, password:pwd},
        };
        this.notify('progress', {max: 10, value: 0});
        return api.adminListWorkspaces().then(res => {
            if(!res || !res.data || !res.data.children) {
                this.notify('progress', {max: 10, value: 10});
                return [];
            }
            const nodes = res.data.children;
            const wsProms = [];
            let pg = 1;
            const keys = Object.keys(nodes).map(k => k === '/' ? "0" : k);
            const max = keys.length + 1;
            this.notify('progress', {max, value: pg});
            keys.forEach(k => {
                wsProms.push(api.adminGetWorkspace(k + '', {format:'json'}).then(res => {
                    pg++;
                    this.notify('progress', {max, value: pg});
                    return res && res.id ? res : null;
                }).catch(e => {
                    pg++;
                    this.notify('progress', {max, value: pg});
                }));
            });
            return Promise.all(wsProms).then(multiRes => {
                return multiRes.filter(v => v !== null);
            });
        });

    }

    /**
     *
     * @return {Request|PromiseLike<T>|Promise<T>}
     */
    loadTemplatePaths(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listVirtualNodes().then(collection => {
            return collection.Children || [];
        });
    }

    /**
     *
     * @return {Promise<ObjectDataSource>}
     */
    loadDataSources(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        return api.listDataSources().then(res => {
            return res.DataSources || [];
        });
    }

    /**
     *
     * @return {Promise<ObjectDataSource>}
     */
    loadCellsWorkspaces() {
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        let request = new RestSearchWorkspaceRequest();
        let single = new IdmWorkspaceSingleQuery();
        single.scope = IdmWorkspaceScope.constructFromObject('ADMIN');
        request.Queries = [single];
        return api.searchWorkspaces(request).then(res => {
            return res.Workspaces || [];
        })
    }

    /**
     * Gather meta.user info from workspaces
     * @param workspaces [AdminWorkspace]
     */
    static parseUserMetaDefinitions(workspaces){
        const metas = [];
        const factorized = [];
        const links = [];
        workspaces.forEach(ws => {
            if (!ws.features || !ws.features["meta.user"]) {
                return;
            }
            const meta = ws.features["meta.user"];
            let i = 0;
            let suffix = "";
            const base = "meta_fields";
            while(meta[base + suffix]){
                const type = meta["meta_types" + suffix] || "string";
                if (meta["meta_labels" + suffix] && type !== 'creator' && type !== 'updater') {
                    const name = meta[base + suffix];
                    const label = meta["meta_labels" + suffix];
                    const additional = meta["meta_additional" + suffix];
                    const newMeta = {name, label, type, additional, ws};
                    metas.push(newMeta);
                    const left = metas.length - 1;
                    let right;
                    const otherWs = factorized.filter(m => m.type === newMeta.type && m.ws !== newMeta.ws && (newMeta.type !== 'choice' || newMeta.additional === m.additional ));
                    if(!otherWs.length){
                        const facMeta = {...newMeta, namespace:'usermeta-' + LangUtils.computeStringSlug(newMeta.name)};
                        factorized.push(facMeta);
                        right = factorized.length - 1;
                    } else {
                        right = factorized.indexOf(otherWs[0]);
                    }
                    links.push({left, right});
                }
                i++;
                suffix = "_" + i;
            }
        });
        return {metas, factorized, links};
    }

}

export {Loader as default}
