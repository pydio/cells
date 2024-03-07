import Observable from 'pydio/lang/observable'
import {IdmUser, IdmRole} from 'cells-sdk';
import {v4 as uuidv4} from 'uuid'
import Role from './Role'

class User extends Observable{

    /**
     *
     * @param idmUser {IdmUser}
     */
    constructor(idmUser){
        super();
        this.acls = [];
        let parentRoles = [];
        if(idmUser){
            this.idmUser = idmUser;
            if(this.idmUser.Roles){
                this.idmRole = this.idmUser.Roles.filter(r=>r.Uuid === this.idmUser.Uuid)[0];
                if(!this.idmUser.IsGroup){
                    parentRoles = this.idmUser.Roles.filter(r=>r.Uuid !== this.idmUser.Uuid);
                }
            }
            if(!this.idmUser.Attributes){
                this.idmUser.Attributes = {};
            }
        } else{
            this.idmUser = new IdmUser();
            this.idmUser.Uuid = uuidv4();
            this.idmRole = IdmRole.constructFromObject({Uuid: this.idmUser.Uuid});
            this.idmUser.Roles = [this.idmRole];
            this.idmUser.Attributes = {};
        }
        this.role = new Role(this.idmRole, parentRoles);
        this.role.observe('update', () => {
            this.dirty |= this.role.isDirty();
            this.notify('update');
        });
        this.makeSnapshot();
    }

    load(){
        this.role.load().then(()=> {
            this.notify('update');
        });
    }

    isDirty(){
        return this.dirty;
    }

    save(){
        return PydioApi.getRestClient().getIdmApi().updateIdmUser(this.idmUser).then((newUser) => {
            this.idmUser = newUser;
            if(this.role.isDirty()){
                return this.role.save().then(()=>{
                    this.makeSnapshot();
                    this.dirty = false;
                    this.notify('update');
                });
            } else{
                this.makeSnapshot();
                this.dirty = false;
                this.notify('update');
                return Promise.resolve(this);
            }
        });
    }

    revert(){
        this.idmUser = this.snapshot;
        this.makeSnapshot();
        this.dirty = false;
        this.notify('update');
        this.role.revert();
    }

    makeSnapshot(){
        this.snapshot = IdmUser.constructFromObject(JSON.parse(JSON.stringify(this.idmUser)));
    }

    /**
     * @return {Role}
     */
    getRole(){
        return this.role;
    }

    addRole(role){
        let parentRoles = this.idmUser.Roles.filter(r => r.Uuid !== this.idmUser.Uuid);
        parentRoles = [...parentRoles.filter(r => r.Uuid !== role.Uuid), role];
        this.idmUser.Roles = [...parentRoles, this.idmRole];
        this.dirty = true;
        this.role.setUniqueRoleDisplay(null)
        this.role.updateParentRoles(parentRoles);
    }

    removeRole(role){
        const parentRoles = this.idmUser.Roles.filter(r => (r.Uuid !== this.idmUser.Uuid && r.Uuid !== role.Uuid));
        this.idmUser.Roles = [...parentRoles, this.idmRole];
        this.dirty = true;
        this.role.setUniqueRoleDisplay(null)
        this.role.updateParentRoles(parentRoles);
    }

    switchRoles(roleId1, roleId2){
        let parentRoles = this.idmUser.Roles.filter(r => r.Uuid !== this.idmUser.Uuid);
        let pos1, pos2, b;
        for(let i = 0; i < parentRoles.length; i ++){
            if(parentRoles[i].Uuid === roleId1){
                pos1 = i;
                b = parentRoles[i];
            } else if (parentRoles[i].Uuid === roleId2){
                pos2 = i;
            }
        }
        parentRoles[pos1] = parentRoles[pos2];
        parentRoles[pos2] = b;
        this.idmUser.Roles = [...parentRoles, this.idmRole];
        this.dirty = true;
        this.role.setUniqueRoleDisplay(null)
        this.role.updateParentRoles(parentRoles);
    }

    /**
     *
     * @return {IdmUser}
     */
    getIdmUser(){
        return this.buildProxy(this.idmUser);
    }

    /**
     * @param object {IdmUser}
     * @return {IdmUser}
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

export {User as default}