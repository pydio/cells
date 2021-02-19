'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _uuid = require('uuid');

var Role = (function (_Observable) {
    _inherits(Role, _Observable);

    /**
     *
     * @param idmRole {IdmRole}
     * @param parentRoles {IdmRole[]}
     */

    function Role(idmRole) {
        var parentRoles = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        _classCallCheck(this, Role);

        _get(Object.getPrototypeOf(Role.prototype), 'constructor', this).call(this);
        this.acls = [];
        this.dirty = false;
        this.parentRoles = parentRoles;
        this.parentAcls = {};

        if (idmRole) {
            this.idmRole = idmRole;
        } else {
            this.idmRole = new _cellsSdk.IdmRole();
            this.idmRole.Uuid = (0, _uuid.v4)();
        }
        this.makeSnapshot();
    }

    _createClass(Role, [{
        key: 'load',
        value: function load() {
            return this.loadAcls();
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }

        /**
         * @return {IdmRole}
         */
    }, {
        key: 'getIdmRole',
        value: function getIdmRole() {
            return this.buildProxy(this.idmRole);
        }
    }, {
        key: 'makeSnapshot',
        value: function makeSnapshot() {
            var _this = this;

            this.snapshot = _cellsSdk.IdmRole.constructFromObject(JSON.parse(JSON.stringify(this.idmRole)));
            this.aclSnapshot = [];
            this.acls.forEach(function (acl) {
                _this.aclSnapshot.push(_cellsSdk.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl))));
            });
        }
    }, {
        key: 'updateParentRoles',
        value: function updateParentRoles(roles) {
            var _this2 = this;

            this.parentRoles = roles;
            this.loadAcls(true).then(function () {
                _this2.notify("update");
            });
        }

        /**
         * In Action, replace policy / pName to policy:pName
         * @param acls [IdmACL]
         * @return [IdmACL]
         */
    }, {
        key: 'loadAcls',

        /**
         * @return {Promise<any>}
         */
        value: function loadAcls() {
            var _q$RoleIDs,
                _this3 = this;

            var parentsOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var api = new _cellsSdk.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _cellsSdk.RestSearchACLRequest();
            request.Queries = [];
            var q = new _cellsSdk.IdmACLSingleQuery();
            q.RoleIDs = [];
            if (!parentsOnly) {
                q.RoleIDs = [this.idmRole.Uuid];
            }
            (_q$RoleIDs = q.RoleIDs).push.apply(_q$RoleIDs, _toConsumableArray(this.parentRoles.map(function (pRole) {
                return pRole.Uuid;
            })));
            request.Queries.push(q);
            return api.searchAcls(request).then(function (collection) {
                var acls = Role.FormatPolicyAclFromStore(collection.ACLs || []);
                if (_this3.parentRoles.length) {
                    if (!parentsOnly) {
                        _this3.acls = acls.filter(function (acl) {
                            return acl.RoleID === _this3.idmRole.Uuid;
                        });
                    }
                    _this3.parentRoles.forEach(function (r) {
                        _this3.parentAcls[r.Uuid] = acls.filter(function (acl) {
                            return acl.RoleID === r.Uuid;
                        });
                    });
                } else {
                    _this3.acls = acls;
                }
                if (!parentsOnly) {
                    _this3.makeSnapshot();
                }
            });
        }

        /**
         * Revert to previous snapshot
         */
    }, {
        key: 'revert',
        value: function revert() {
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
    }, {
        key: 'save',
        value: function save() {
            var _this4 = this;

            var rApi = new _cellsSdk.RoleServiceApi(_pydioHttpApi2['default'].getRestClient());
            var aclApi = new _cellsSdk.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            return rApi.setRole(this.idmRole.Uuid, this.idmRole).then(function (newRole) {
                _this4.idmRole = newRole;
                // Remove previous acls
                var request = new _cellsSdk.RestSearchACLRequest();
                request.Queries = [];
                var q = new _cellsSdk.IdmACLSingleQuery();
                q.RoleIDs = [_this4.idmRole.Uuid];
                request.Queries.push(q);
                return aclApi.searchAcls(request).then(function (collection) {
                    var ps = [];
                    if (collection.ACLs) {
                        collection.ACLs.forEach(function (existing) {
                            ps.push(aclApi.deleteAcl(existing));
                        });
                    }
                    return Promise.all(ps).then(function (res) {
                        var p2 = [];
                        Role.FormatPolicyAclToStore(_this4.acls).forEach(function (acl) {
                            p2.push(aclApi.putAcl(acl));
                        });
                        return Promise.all(p2).then(function (results) {
                            var newAcls = [];
                            results.forEach(function (res) {
                                newAcls.push(res);
                            });
                            _this4.acls = Role.FormatPolicyAclFromStore(newAcls);
                            _this4.makeSnapshot();
                            _this4.dirty = false;
                            _this4.notify("update");
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
    }, {
        key: 'setParameter',
        value: function setParameter(aclKey, paramValue) {
            var _this5 = this;

            var scope = arguments.length <= 2 || arguments[2] === undefined ? 'PYDIO_REPO_SCOPE_ALL' : arguments[2];

            var vals = this.acls.filter(function (acl) {
                return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
            });
            if (vals.length) {
                (function () {
                    var foundAcl = vals[0];
                    // Check if we are switching back to an inherited value
                    var parentValue = undefined;
                    _this5.parentRoles.forEach(function (role) {
                        parentValue = _this5.getAclValue(_this5.parentAcls[role.Uuid], aclKey, scope, parentValue);
                    });
                    if (parentValue !== undefined && parentValue === paramValue) {
                        _this5.acls = _this5.acls.filter(function (acl) {
                            return acl !== foundAcl;
                        }); // Remove ACL
                    } else {
                            foundAcl.Action.Value = JSON.stringify(paramValue);
                        }
                })();
            } else {
                var acl = new _cellsSdk.IdmACL();
                acl.RoleID = this.idmRole.Uuid;
                acl.WorkspaceID = scope;
                acl.Action = new _cellsSdk.IdmACLAction();
                acl.Action.Name = aclKey;
                acl.Action.Value = JSON.stringify(paramValue);
                this.acls.push(acl);
            }
            this.dirty = true;
            this.notify('update');
        }

        /**
         *
         * @param acl {IdmACL}
         */
    }, {
        key: 'deleteParameter',
        value: function deleteParameter(acl) {
            this.acls = this.acls.filter(function (a) {
                return a !== acl;
            });
            this.dirty = true;
            this.notify('update');
        }

        /**
         * Get a parameter value
         * @param aclKey
         * @param scope
         * @return {*}
         */
    }, {
        key: 'getParameterValue',
        value: function getParameterValue(aclKey) {
            var _this6 = this;

            var scope = arguments.length <= 1 || arguments[1] === undefined ? 'PYDIO_REPO_SCOPE_ALL' : arguments[1];

            var value = undefined;
            this.parentRoles.forEach(function (role) {
                value = _this6.getAclValue(_this6.parentAcls[role.Uuid], aclKey, scope, value);
            });
            return this.getAclValue(this.acls, aclKey, scope, value);
        }

        /**
         *
         * @return {IdmACL[]}
         */
    }, {
        key: 'listParametersAndActions',
        value: function listParametersAndActions() {
            var _this7 = this;

            var filterParam = function filterParam(a) {
                return a.Action.Name && (a.Action.Name.indexOf("parameter:") === 0 || a.Action.Name.indexOf("action:") === 0);
            };

            var acls = this.acls || [];
            acls = acls.filter(filterParam);
            this.parentRoles.forEach(function (role) {
                var inherited = _this7.parentAcls[role.Uuid] || [];
                inherited = inherited.filter(filterParam).filter(function (a) {
                    return !acls.filter(function (f) {
                        return f.Action.Name === a.Action.Name;
                    }).length; // add only if not already set in main role
                }).map(function (a) {
                    var copy = _cellsSdk.IdmACL.constructFromObject(JSON.parse(JSON.stringify(a)));
                    copy.INHERITED = true;
                    return copy;
                });
                acls = [].concat(_toConsumableArray(acls), _toConsumableArray(inherited));
            });

            return acls;
        }
    }, {
        key: 'getAclValue',
        value: function getAclValue(aclArray, aclKey, scope, previousValue) {
            if (!aclArray) {
                return previousValue;
            }
            var vals = aclArray.filter(function (acl) {
                return acl.Action.Name === aclKey && acl.WorkspaceID === scope;
            });
            try {
                return JSON.parse(vals[0].Action.Value);
            } catch (e) {
                return previousValue;
            }
        }

        /**
         * @param workspace {IdmWorkspace}
         * @param nodeUuid string
         */
    }, {
        key: 'getAclString',
        value: function getAclString(workspace, nodeUuid) {
            var _this8 = this;

            var inherited = false;
            var wsId = undefined,
                nodeId = undefined;
            if (workspace) {
                var rootNodes = workspace.RootNodes;
                var firstRoot = rootNodes[Object.keys(rootNodes).shift()];
                wsId = workspace.UUID;
                nodeId = firstRoot.Uuid;
            } else {
                nodeId = nodeUuid;
            }

            var rights = undefined;
            var parentRights = undefined;
            this.parentRoles.forEach(function (role) {
                var parentRight = _this8._aclStringForAcls(_this8.parentAcls[role.Uuid], wsId, nodeId);
                if (parentRight !== undefined) {
                    parentRights = parentRight;
                }
            });
            var roleRigts = this._aclStringForAcls(this.acls, wsId, nodeId);
            if (roleRigts !== undefined) {
                rights = roleRigts;
            } else if (parentRights !== undefined) {
                rights = parentRights;
                inherited = true;
            } else {
                return { aclString: "" };
            }

            var aclString = Object.keys(rights).filter(function (r) {
                return rights[r];
            }).join(',');
            return { aclString: aclString, inherited: inherited };
        }
    }, {
        key: '_aclStringForAcls',
        value: function _aclStringForAcls(acls, wsId, nodeId) {
            var rights = { read: false, write: false, deny: false };

            var policyValue = acls.filter(function (acl) {
                return acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0 && (!wsId || acl.WorkspaceID === wsId) && acl.NodeID === nodeId && acl.Action.Value === "1";
            });

            if (policyValue.length) {
                rights[policyValue[0].Action.Name] = true;
                return rights;
            }

            Object.keys(rights).forEach(function (rightName) {
                var values = acls.filter(function (acl) {
                    return acl.Action.Name === rightName && (!wsId || acl.WorkspaceID === wsId) && acl.NodeID === nodeId && acl.Action.Value === "1";
                });
                if (values.length) {
                    rights[rightName] |= true;
                }
            });
            if (!rights.read && !rights.write && !rights.deny) {
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
         * @param nodeWs {IdmWorkspace}
         */
    }, {
        key: 'updateAcl',
        value: function updateAcl(workspace, nodeUuid, value) {
            var _this9 = this;

            var nodeWs = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

            var nodeIds = [];
            var isRoot = false;
            if (nodeUuid) {
                nodeIds = [nodeUuid];
                isRoot = nodeWs && Object.keys(nodeWs.RootNodes).indexOf(nodeUuid) > -1;
            } else {
                nodeIds = Object.keys(workspace.RootNodes);
            }
            if (workspace) {
                // Remove current global acls
                this.acls = this.acls.filter(function (acl) {
                    return !((acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0) && acl.WorkspaceID === workspace.UUID && nodeIds.indexOf(acl.NodeID) > -1 && acl.Action.Value === "1");
                });
            } else {
                // Remove node acls
                this.acls = this.acls.filter(function (acl) {
                    return !((acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0) && acl.NodeID === nodeUuid && acl.Action.Value === "1");
                });
            }
            if (value !== '') {
                value.split(',').forEach(function (r) {
                    nodeIds.forEach(function (n) {
                        var acl = new _cellsSdk.IdmACL();
                        acl.NodeID = n;
                        if (workspace) {
                            acl.WorkspaceID = workspace.UUID;
                        } else if (isRoot) {
                            acl.WorkspaceID = nodeWs.UUID;
                        }
                        acl.RoleID = _this9.idmRole.Uuid;
                        acl.Action = _cellsSdk.IdmACLAction.constructFromObject({ Name: r, Value: "1" });
                        _this9.acls.push(acl);
                    });
                });
            }
            this.dirty = true;
            this.notify('update');
        }

        /**
         * @param object {IdmRole}
         * @return {IdmRole}
         */
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this10 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this10.dirty = true;
                    _this10.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this10.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }], [{
        key: 'FormatPolicyAclFromStore',
        value: function FormatPolicyAclFromStore(acls) {
            return acls.map(function (acl) {
                if (acl.Action && acl.Action.Name === 'policy') {
                    acl.Action.Name = 'policy:' + acl.Action.Value;
                    acl.Action.Value = '1';
                }
                return acl;
            });
        }

        /**
         * In Action, replace policy:pName to policy/pName
         * @param acls [IdmACL]
         * @return [IdmACL]
         */
    }, {
        key: 'FormatPolicyAclToStore',
        value: function FormatPolicyAclToStore(acls) {
            return acls.map(function (acl) {
                if (acl.Action && acl.Action.Name.indexOf('policy:') === 0) {
                    var copy = _cellsSdk.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl)));
                    copy.Action.Name = 'policy';
                    copy.Action.Value = acl.Action.Name.split(':')[1];
                    return copy;
                } else {
                    return acl;
                }
            });
        }
    }]);

    return Role;
})(_pydioLangObservable2['default']);

exports['default'] = Role;
module.exports = exports['default'];
