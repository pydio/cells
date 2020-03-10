import PydioApi from 'pydio/http/api'
import ResourcesManager from 'pydio/http/resources-manager';

class TplManager {

    static getInstance(){
        if(!TplManager.instance){
            TplManager.instance = new TplManager();
        }
        return TplManager.instance;
    }

    constructor(){}

    getSdk() {
        return ResourcesManager.loadClass('EnterpriseSDK');
    }

    listJobs(){}
    saveJob(id, job){}
    deleteJob(id){}

    listSelectors(){
        return this.getSdk().then(sdk => {
            const {EntListSelectorTemplatesRequest, SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            return api.listSelectorTemplates(new EntListSelectorTemplatesRequest()).then(result => {
                const data = {
                    filters:{nodes:[], idm:[], context:[], output:[]},
                    selectors:{nodes:[], idm:[], context:[], output:[]},
                };
                const tt = result.Templates || [];
                tt.forEach(t => {
                    let first = 'selectors';
                    let second;
                    if(t.AsFilter) {
                        first = 'filters';
                    }
                    if(t.IdmSelector){
                        second = 'idm';
                    } else if(t.ActionOutputFilter){
                        second = 'output';
                    } else if(t.ContextMetaFilter){
                        second = 'context';
                    }  else {
                        second = 'nodes';
                    }
                    data[first][second].push(t);
                });
                return data;
            })
        });
    }

    saveSelector(id, asFilter, label, description, type, data){
        return this.getSdk().then(sdk => {
            const {EntPutSelectorTemplateRequest, EntSelectorTemplate, SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            const req = new EntPutSelectorTemplateRequest();
            const tpl = new EntSelectorTemplate();
            tpl.Name = id;
            tpl.AsFilter = asFilter;
            tpl.Label = label;
            tpl.Description = description;
            switch (type) {
                case "idm":
                    tpl.IdmSelector = data;
                    break;
                case "context":
                    tpl.ContextMetaFilter = data;
                    break;
                case "output":
                    tpl.ActionOutputFilter = data;
                    break;
                default:
                    tpl.NodesSelector = data;
                    break;

            }
            req.Template = tpl;
            return api.putSelectorTemplate(req);
        })
    }

    deleteSelector(id){
        return this.getSdk().then(sdk => {
            const {SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            return api.deleteSelectorTemplate(id);
        })
    }

    listActions(){
        return this.getSdk().then(sdk => {
            const {EntListActionTemplatesRequest, SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            return api.listActionTemplates(new EntListActionTemplatesRequest()).then(result => {
                const tt = result.Templates || [];
                return tt.map(t => {
                    const a = t.Action;
                    a.TemplateName = t.Name;
                    return a;
                });
            })
        })
    }

    saveAction(id, action){
        return this.getSdk().then(sdk => {
            const {EntPutActionTemplateRequest, EntActionTemplate, SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            const req = new EntPutActionTemplateRequest();
            const tpl = new EntActionTemplate();
            tpl.Name = id;
            tpl.Action = action;
            req.Template = tpl;
            return api.putActionTemplate(req);
        })
    }

    deleteAction(tplName) {
        return this.getSdk().then(sdk => {
            const {SchedulerServiceApi} = sdk;
            const api = new SchedulerServiceApi(PydioApi.getRestClient());
            return api.deleteActionTemplate(tplName);
        })
    }

}

export default TplManager