class IdmObjectHelper {

    static extractLabel(pydio, acl){
        if(acl.User){
            if(acl.User.Login === pydio.user.id) {
                return pydio.MessageHash['634'];
            } else if (acl.User.Attributes && acl.User.Attributes['displayName']){
                return acl.User.Attributes['displayName'];
            } else {
                return acl.User.Login;
            }
        } else if(acl.Group){
            if(acl.Group.Uuid === 'ROOT_GROUP') {
                return pydio.MessageHash['634c'];
            }else if(acl.Group.GroupLabel) {
                return pydio.MessageHash['289'] + ' ' + acl.Group.GroupLabel;
            } else {
                return acl.Group.Uuid;
            }
        } else if (acl.Role) {
            return acl.Role.Label;
        } else {
            return '';
        }
    }

    static extractLabelFromIdmObject(idmObject){
        if(idmObject.Login){
            // this is a user
            return (idmObject.Attributes && idmObject.Attributes['displayName'] || idmObject.Login);
        } else if(idmObject.GroupPath) {
            if(idmObject.Uuid === 'ROOT_GROUP') {
                return pydio.MessageHash['634c'];
            }
            return (idmObject.GroupLabel || ('Group ' + idmObject.GroupPath));
        } else if (idmObject.Label) {
            return idmObject.Label
        } else {
            return idmObject.Uuid;
        }
    }

}

export {IdmObjectHelper as default}