import Observable from 'pydio/lang/observable'
import PydioApi from 'pydio/http/api'
import {IdmRole, IdmACL, IdmACLAction, ACLServiceApi, RoleServiceApi, RestSearchACLRequest, IdmACLSingleQuery} from 'pydio/http/rest-api';
import {sync as uuid} from 'uuid4'

class Role extends Observable{

    /**
     *
     * @param idmRole {IdmRole}
     * @param parentRoles {IdmRole[]}
     */
    constructor(idmRole, parentRoles = []){
        super();
        this.acls = [];
        this.dirty = false;
        this.parentRoles = parentRoles;
        this.parentAcls = {};

        if(idmRole){
            this.idmRole = idmRole;
        } else{
            this.idmRole = new IdmRole();
            this.idmRole.Uuid = uuid();
        }
        this.makeSnapshot();
    }

    load(){
        return this.loadAcls();
    }

    isDirty(){
        return this.dirty;
    }

    /**
     * @return {IdmRole}
     */
    getIdmRole(){
        return this.buildProxy(this.idmRole);
    }

    makeSnapshot(){
        this.snapshot = IdmRole.constructFromObject(JSON.parse(JSON.stringify(this.idmRole)));
        this.aclSnapshot = [];
        this.acls.forEach(acl => {
            this.aclSnapshot.push(IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl))))
        });
    }

    updateParentRoles(roles){
        this.parentRoles = roles;
        this.loadAcls(true).then(() => {
            this.notify("update");
        });
    }

    /**
     * @return {Promise<any>}
     */
    loadAcls(parentsOnly = false){
        const api = new ACLServiceApi(PydioApi.getRestClient());
        const request = new RestSearchACLRequest();
        request.Queries = [];
        const q = new IdmACLSingleQuery();
        q.RoleIDs = [];
        if(!parentsOnly){
            q.RoleIDs = [this.idmRole.Uuid];
        }
        q.RoleIDs.push(...this.parentRoles.map(pRole => pRole.Uuid));
        request.Queries.push(q);
        return api.searchAcls(request).then(collection => {
            if(this.parentRoles.length){
                const acls = collection.ACLs || [];
                if(!parentsOnly){
                    this.acls = acls.filter(acl => acl.RoleID === this.idmRole.Uuid);
                }
                this.parentRoles.forEach(r => {
                    this.parentAcls[r.Uuid] = acls.filter(acl => acl.RoleID === r.Uuid);
                });
            }else{
                this.acls = collection.ACLs || [];
            }
            console.log(this);
            if(!parentsOnly){
                this.makeSnapshot();
            }
        });
    }

    /**
     * Revert to previous snapshot
     */
    revert(){
        this.idmRole = this.snapshot;
        this.acls = this.aclSnapshot;
        this.dirty = false;
        this.makeSnapshot();
        this.notify('update');
    }

    /**
     *
     * @return {Promise<any>}
     */
    save(){
        const rApi = new RoleServiceApi(PydioApi.getRestClient());
        const aclApi = new ACLServiceApi(PydioApi.getRestClient());
        return rApi.setRole(this.idmRole.Uuid, this.idmRole).then(newRole => {
            this.idmRole = newRole;
            // Remove previous acls
            const request = new RestSearchACLRequest();
            request.Queries = [];
            const q = new IdmACLSingleQuery();
            q.RoleIDs = [this.idmRole.Uuid];
            request.Queries.push(q);
            return aclApi.searchAcls(request).then(collection => {
                let ps = [];
                if(collection.ACLs) {
                    collection.ACLs.forEach(existing => {
                        ps.push(aclApi.deleteAcl(existing));
                    });
                }
                return Promise.all(ps).then(res => {
                    let p2 = [];
                    this.acls.forEach(acl => {
                        p2.push(aclApi.putAcl(acl));
                    });
                    return Promise.all(p2).then(() => {
                        this.makeSnapshot();
                        this.dirty = false;
                        this.notify("update");
                    });
                });
            });

        });
    }

    /**
     * Set a parameter value
     * @param aclKey
     * @param paramValue
     * @param scope
     */
    setParameter(aclKey, paramValue, scope = 'PYDIO_REPO_SCOPE_ALL'){
        const vals = this.acls.filter(acl => {
            return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
        });
        if(vals.length){
            let foundAcl = vals[0];
            // Check if we are switching back to an inherited value
            let parentValue = undefined;
            this.parentRoles.forEach(role => {
                parentValue = this.getAclValue(this.parentAcls[role.Uuid], aclKey, scope, parentValue);
            });
            if(parentValue !== undefined && parentValue === paramValue){
                this.acls = this.acls.filter(acl => acl !== foundAcl); // Remove ACL
            }else{
                foundAcl.Action.Value = JSON.stringify(paramValue);
            }
        } else {
            let acl = new IdmACL();
            acl.RoleID = this.idmRole.Uuid;
            acl.WorkspaceID = scope;
            acl.Action = new IdmACLAction();
            acl.Action.Name = aclKey;
            acl.Action.Value = JSON.stringify(paramValue);
            this.acls.push(acl);
        }
        this.dirty = true;
        this.notify('update');
    }

    /**
     * Get a parameter value
     * @param aclKey
     * @param scope
     * @return {*}
     */
    getParameterValue(aclKey, scope = 'PYDIO_REPO_SCOPE_ALL'){
        let value = undefined;
        this.parentRoles.forEach(role => {
            value = this.getAclValue(this.parentAcls[role.Uuid], aclKey, scope, value);
        });
        return this.getAclValue(this.acls, aclKey, scope, value);

    }

    getAclValue(aclArray, aclKey, scope, previousValue){
        if(!aclArray){
            return previousValue;
        }
        const vals = aclArray.filter(acl => {
            return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
        });
        try{
            return JSON.parse(vals[0].Action.Value);
        }catch(e){
            return previousValue;
        }
    }

    /**
     * @param object {IdmRole}
     * @return {IdmRole}
     */
    buildProxy(object){
        return new Proxy(object, {
            set:((target, p, value) => {
                target[p] = value;
                this.dirty = true;
                this.notify('update');
                return true;
            }),
            get:((target, p) => {
                let out = target[p];
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

}

export {Role as default}