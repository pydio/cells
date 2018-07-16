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
                    return Promise.all(p2).then((results) => {
                        let newAcls = [];
                        results.forEach(res => {
                            newAcls.push(res);
                        });
                        this.acls = newAcls;
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
     * @param workspace {IdmWorkspace}
     * @param nodeUuid string
     */
    getAclString(workspace, nodeUuid){
        let inherited = false;
        let wsId, nodeId;
        if(workspace){
            const rootNodes = workspace.RootNodes;
            const firstRoot = rootNodes[Object.keys(rootNodes).shift()];
            wsId = workspace.UUID;
            nodeId = firstRoot.Uuid;
        } else {
            nodeId = nodeUuid;
        }

        let rights;
        let parentRights;
        this.parentRoles.forEach(role => {
            const parentRight = this._aclStringForAcls(this.parentAcls[role.Uuid], wsId, nodeId);
            if(parentRight !== undefined){
                parentRights = parentRight;
            }
        });
        let roleRigts = this._aclStringForAcls(this.acls, wsId, nodeId);
        if(roleRigts !== undefined){
            rights = roleRigts;
        } else if(parentRights !== undefined){
            rights = parentRights;
            inherited = true;
        } else {
            return {aclString: "", false};
        }

        const aclString = Object.keys(rights).filter(r=>rights[r]).join(',');
        return {aclString, inherited}
    }

    _aclStringForAcls(acls, wsId, nodeId){
        let rights = {read:false, write:false, deny:false};

        const policyValue = acls.filter(acl => {
            return (
                acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0 &&
                (!wsId || acl.WorkspaceID === wsId) &&
                acl.NodeID === nodeId &&
                acl.Action.Value === "1"
            );
        });

        if(policyValue.length){
            rights[policyValue[0].Action.Name] = true;
            return rights;
        }

        Object.keys(rights).forEach(rightName => {
            const values = acls.filter(acl => {
                return (
                    acl.Action.Name === rightName &&
                    (!wsId || acl.WorkspaceID === wsId) &&
                    acl.NodeID === nodeId &&
                    acl.Action.Value === "1"
                );
            });
            if(values.length){
                rights[rightName] |= true
            }
        });
        if(!rights.read && !rights.write && !rights.deny){
            return undefined;
        } else {
            return rights;
        }
    }

    /**
     *
     * @param workspace {IdmWorkspace}
     * @param nodeUuid string
     * @param value string
     */
    updateAcl(workspace, nodeUuid, value){
        console.log(workspace, value);
        let nodeIds = [];
        if(nodeUuid){
            nodeIds = [nodeUuid];
        } else {
            nodeIds = Object.keys(workspace.RootNodes);
        }
        if(workspace){
            // Remove current global acls
            this.acls = this.acls.filter(acl => {
                return !(
                    (acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || (acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0))
                    && acl.WorkspaceID === workspace.UUID
                    && nodeIds.indexOf(acl.NodeID) > -1
                    && acl.Action.Value === "1"
                );
            });
        } else {
            // Remove node acls
            this.acls = this.acls.filter(acl => {
                return !(
                    (acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || (acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0))
                    && acl.NodeID === nodeUuid
                    && acl.Action.Value === "1"
                );
            });
        }
        if (value !== ''){
            value.split(',').forEach(r => {
                nodeIds.forEach(n => {
                    const acl = new IdmACL();
                    acl.NodeID = n;
                    if(workspace){
                        acl.WorkspaceID = workspace.UUID;
                    }
                    acl.RoleID = this.idmRole.Uuid;
                    acl.Action = IdmACLAction.constructFromObject({Name:r, Value: "1"});
                    this.acls.push(acl);
                })
            });
        }
        console.log(this.acls);
        this.dirty = true;
        this.notify('update');
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