import Pydio from 'pydio'
import PydioApi from "pydio/http/api";
import LangUtils from 'pydio/util/lang'
import Observable from "pydio/lang/observable";
import {WorkspaceServiceApi, RestSearchWorkspaceRequest, IdmWorkspaceSingleQuery, IdmWorkspaceScope, IdmWorkspace} from 'cells-sdk';

class Workspace extends Observable{

    buildProxy(object){
        return new Proxy(object, {
            set:((target, p, value) => {
                let val = value;
                if(p === 'Slug') {
                    val = LangUtils.computeStringSlug(val);
                } else if(p === 'Label' && this.create){
                    target['Slug'] = LangUtils.computeStringSlug(val);
                }
                target[p] = val;
                this.dirty = true;
                this.notify('update');
                return true;
            }),
            get:((target, p) => {
                let out = target[p];
                if (p === 'Attributes'){
                    out = this.internalAttributes;
                }
                if (out instanceof Array) {
                    return out;
                } else if (out instanceof Object) {
                    return this.buildProxy(out);
                } else {
                    return out;
                }
            })
        });
    }

    /**
     * @param model {IdmWorkspace}
     */
    constructor(model){
        super();
        this.internalAttributes = {};
        this.dirty = false;
        if (model) {
            this.initModel(model);
        } else {
            this.create = true;
            this.model = new IdmWorkspace();
            this.model.Scope = IdmWorkspaceScope.constructFromObject('ADMIN');
            this.model.RootNodes = {};
            this.internalAttributes = {"DEFAULT_RIGHTS": ""};
            this.model.PoliciesContextEditable = true;
            this.model.Attributes = JSON.stringify(this.internalAttributes);
        }
        this.observableModel = this.buildProxy(this.model);
    }

    initModel(model){
        this.create = false;
        this.dirty = false;
        this.model = model;
        this.snapshot = JSON.parse(JSON.stringify(model));
        if(model.Attributes){
            const atts = JSON.parse(model.Attributes);
            if (typeof atts === "object" && Object.keys(atts).length) {
                this.internalAttributes = atts;
            }
        } else {
            this.internalAttributes = {};
        }
        if(!model.RootNodes){
            model.RootNodes = {};
        }
    }

    /**
     * @return {IdmWorkspace}
     */
    getModel(){
        return this.observableModel;
    }

    /**
     * @return {boolean}
     */
    hasTemplatePath(){
        return Object.keys(this.model.RootNodes).filter(k => {
            return Workspace.rootIsTemplatePath(this.model.RootNodes[k]) ;
        }).length > 0;
    }

    /**
     * @return {boolean}
     */
    hasFolderRoots(){
        return Object.keys(this.model.RootNodes).filter(k => {
            return !Workspace.rootIsTemplatePath(this.model.RootNodes[k]) ;
        }).length > 0;
    }

    /**
     *
     * @return {Promise<any>}
     */
    save(){
        // If Policies are not set, REST service will add default policies
        this.model.Attributes = JSON.stringify(this.internalAttributes);
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        return api.putWorkspace(this.model.Slug, this.model).then(ws => {
            this.initModel(ws);
            this.observableModel = this.buildProxy(this.model);
            return ws;
        });
    }

    /**
     *
     * @return {Promise}
     */
    remove(){
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        return api.deleteWorkspace(this.model.Slug);
    }

    /**
     * Revert state
     */
    revert(){
        const revert = IdmWorkspace.constructFromObject(this.snapshot || {});
        this.initModel(revert);
        this.observableModel = this.buildProxy(this.model);
    }

    /**
     * @return {boolean}
     */
    isValid(){
        return this.model.Slug && this.model.Label && Object.keys(this.model.RootNodes).length > 0;
    }

    isDirty(){
        return this.dirty;
    }

    /**
     *
     * @param node {TreeNode}
     * @return bool
     */
    static rootIsTemplatePath(node){
        return !!(node.MetaStore && node.MetaStore['resolution']);
    }

    static listWorkspaces(){
        const api = new WorkspaceServiceApi(PydioApi.getRestClient());
        let request = new RestSearchWorkspaceRequest();
        let single = new IdmWorkspaceSingleQuery();
        single.scope = IdmWorkspaceScope.constructFromObject('ADMIN');
        request.Queries = [single];
        return api.searchWorkspaces(request);
    }

}

export {Workspace as default}