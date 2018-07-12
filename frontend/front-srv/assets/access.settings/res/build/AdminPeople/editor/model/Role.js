'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid4 = require('uuid4');

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
            this.idmRole = new _pydioHttpRestApi.IdmRole();
            this.idmRole.Uuid = (0, _uuid4.sync)();
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

            this.snapshot = _pydioHttpRestApi.IdmRole.constructFromObject(JSON.parse(JSON.stringify(this.idmRole)));
            this.aclSnapshot = [];
            this.acls.forEach(function (acl) {
                _this.aclSnapshot.push(_pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl))));
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
         * @return {Promise<any>}
         */
    }, {
        key: 'loadAcls',
        value: function loadAcls() {
            var _q$RoleIDs,
                _this3 = this;

            var parentsOnly = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var api = new _pydioHttpRestApi.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.RestSearchACLRequest();
            request.Queries = [];
            var q = new _pydioHttpRestApi.IdmACLSingleQuery();
            q.RoleIDs = [];
            if (!parentsOnly) {
                q.RoleIDs = [this.idmRole.Uuid];
            }
            (_q$RoleIDs = q.RoleIDs).push.apply(_q$RoleIDs, _toConsumableArray(this.parentRoles.map(function (pRole) {
                return pRole.Uuid;
            })));
            request.Queries.push(q);
            return api.searchAcls(request).then(function (collection) {
                if (_this3.parentRoles.length) {
                    (function () {
                        var acls = collection.ACLs || [];
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
                    })();
                } else {
                    _this3.acls = collection.ACLs || [];
                }
                console.log(_this3);
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

            var rApi = new _pydioHttpRestApi.RoleServiceApi(_pydioHttpApi2['default'].getRestClient());
            var aclApi = new _pydioHttpRestApi.ACLServiceApi(_pydioHttpApi2['default'].getRestClient());
            return rApi.setRole(this.idmRole.Uuid, this.idmRole).then(function (newRole) {
                _this4.idmRole = newRole;
                // Remove previous acls
                var request = new _pydioHttpRestApi.RestSearchACLRequest();
                request.Queries = [];
                var q = new _pydioHttpRestApi.IdmACLSingleQuery();
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
                        _this4.acls.forEach(function (acl) {
                            p2.push(aclApi.putAcl(acl));
                        });
                        return Promise.all(p2).then(function (results) {
                            var newAcls = [];
                            results.forEach(function (res) {
                                newAcls.push(res);
                            });
                            _this4.acls = newAcls;
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
                var acl = new _pydioHttpRestApi.IdmACL();
                acl.RoleID = this.idmRole.Uuid;
                acl.WorkspaceID = scope;
                acl.Action = new _pydioHttpRestApi.IdmACLAction();
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
         */
    }, {
        key: 'getAclString',
        value: function getAclString(workspace) {
            var _this7 = this;

            var inherited = false;
            var rootNodes = workspace.RootNodes;
            var firstRoot = rootNodes[Object.keys(rootNodes).shift()];
            var wsId = workspace.UUID;
            var nodeId = firstRoot.Uuid;

            var rights = undefined;
            var parentRights = undefined;
            this.parentRoles.forEach(function (role) {
                var parentRight = _this7._aclStringForAcls(_this7.parentAcls[role.Uuid], wsId, nodeId);
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
                return { aclString: "", 'false': false };
            }

            if (rights.deny) {
                return { aclString: 'PYDIO_VALUE_CLEAR', inherited: inherited };
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
                return acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0 && acl.WorkspaceID === wsId && acl.NodeID === nodeId && acl.Action.Value === "1";
            });

            if (policyValue.length) {
                rights[policyValue[0].Action.Name] = true;
                return rights;
            }

            Object.keys(rights).forEach(function (rightName) {
                var values = acls.filter(function (acl) {
                    return acl.Action.Name === rightName && acl.WorkspaceID === wsId && acl.NodeID === nodeId && acl.Action.Value === "1";
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
         * @param value string
         */
    }, {
        key: 'updateAcl',
        value: function updateAcl(workspace, value) {
            var _this8 = this;

            console.log(workspace, value);

            var nodeIds = Object.keys(workspace.RootNodes);
            // Remove current acls
            this.acls = this.acls.filter(function (acl) {
                return !((acl.Action.Name === 'read' || acl.Action.Name === 'write' || acl.Action.Name === 'deny' || acl.Action.Name && acl.Action.Name.indexOf("policy:") === 0) && acl.WorkspaceID === workspace.UUID && nodeIds.indexOf(acl.NodeID) > -1 && acl.Action.Value === "1");
            });
            if (value !== '') {
                var rights = value.split(',');
                if (value === 'PYDIO_VALUE_CLEAR') {
                    rights = ['deny'];
                }
                rights.forEach(function (r) {
                    nodeIds.forEach(function (n) {
                        var acl = new _pydioHttpRestApi.IdmACL();
                        acl.NodeID = n;
                        acl.WorkspaceID = workspace.UUID;
                        acl.RoleID = _this8.idmRole.Uuid;
                        acl.Action = _pydioHttpRestApi.IdmACLAction.constructFromObject({ Name: r, Value: "1" });
                        _this8.acls.push(acl);
                    });
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
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this9 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this9.dirty = true;
                    _this9.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this9.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    return Role;
})(_pydioLangObservable2['default']);

exports['default'] = Role;
module.exports = exports['default'];
