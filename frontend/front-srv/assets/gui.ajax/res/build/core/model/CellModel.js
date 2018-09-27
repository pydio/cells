/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _IdmObjectHelper = require('./IdmObjectHelper');

var _IdmObjectHelper2 = _interopRequireDefault(_IdmObjectHelper);

var _httpGenIndex = require('../http/gen/index');

var CellModel = (function (_Observable) {
    _inherits(CellModel, _Observable);

    function CellModel() {
        var editMode = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        _classCallCheck(this, CellModel);

        _Observable.call(this);
        // Create an empty room
        this.cell = new _httpGenIndex.RestCell();
        this.cell.Label = '';
        this.cell.Description = '';
        this.cell.ACLs = {};
        this.cell.RootNodes = [];
        this.cell.Policies = [];
        this.cell.PoliciesContextEditable = true;
        this._edit = editMode;
    }

    CellModel.prototype.isDirty = function isDirty() {
        return this.dirty;
    };

    CellModel.prototype.isEditable = function isEditable() {
        return this.cell.PoliciesContextEditable;
    };

    CellModel.prototype.getRootNodes = function getRootNodes() {
        return this.cell.RootNodes;
    };

    CellModel.prototype.notifyDirty = function notifyDirty() {
        this.dirty = true;
        this.notify('update');
    };

    CellModel.prototype.revertChanges = function revertChanges() {
        if (this.originalCell) {
            this.cell = this.clone(this.originalCell);
            this.dirty = false;
            this.notify('update');
        }
    };

    /**
     *
     * @param node {TreeNode}
     * @return string
     */

    CellModel.prototype.getNodeLabelInContext = function getNodeLabelInContext(node) {
        var _this = this;

        var path = node.Path;
        var label = _utilPathUtils2['default'].getBasename(path);
        if (node.MetaStore && node.MetaStore.selection) {
            return label;
        }
        if (node.MetaStore && node.MetaStore.CellNode) {
            return '[Cell Folder]';
        }
        if (node.AppearsIn && node.AppearsIn.length) {
            node.AppearsIn.map(function (workspaceRelativePath) {
                if (workspaceRelativePath.WsUuid !== _this.cell.Uuid) {
                    label = '[' + workspaceRelativePath.WsLabel + '] ' + _utilPathUtils2['default'].getBasename(workspaceRelativePath.Path);
                }
            });
        }
        return label;
    };

    /**
     *
     * @return {string}
     */

    CellModel.prototype.getAclsSubjects = function getAclsSubjects() {
        var _this2 = this;

        return Object.keys(this.cell.ACLs).map(function (roleId) {
            var acl = _this2.cell.ACLs[roleId];
            return _IdmObjectHelper2['default'].extractLabel(_pydio2['default'].getInstance(), acl);
        }).join(', ');
    };

    /**
     * @return {Object.<String, module:model/RestCellAcl>}
     */

    CellModel.prototype.getAcls = function getAcls() {
        return this.cell.ACLs;
    };

    /**
     *
     * @param idmObject IdmUser|IdmRole
     */

    CellModel.prototype.addUser = function addUser(idmObject) {
        var acl = new _httpGenIndex.RestCellAcl();
        acl.RoleId = idmObject.Uuid;
        if (idmObject.Login !== undefined) {
            acl.IsUserRole = true;
            acl.User = idmObject;
        } else if (idmObject.IsGroup) {
            acl.Group = idmObject;
        } else {
            acl.Role = idmObject;
        }
        acl.Actions = [];
        var action = new _httpGenIndex.IdmACLAction();
        action.Name = 'read';
        action.Value = '1';
        acl.Actions.push(action);
        this.cell.ACLs[acl.RoleId] = acl;
        this.notifyDirty();
    };

    /**
     *
     * @param roleId string
     */

    CellModel.prototype.removeUser = function removeUser(roleId) {
        if (this.cell.ACLs[roleId]) {
            delete this.cell.ACLs[roleId];
        }
        this.notifyDirty();
    };

    /**
     *
     * @param roleId string
     * @param right string
     * @param value bool
     */

    CellModel.prototype.updateUserRight = function updateUserRight(roleId, right, value) {
        if (value) {
            var acl = this.cell.ACLs[roleId];
            var action = new _httpGenIndex.IdmACLAction();
            action.Name = right;
            action.Value = '1';
            acl.Actions.push(action);
            this.cell.ACLs[roleId] = acl;
        } else {
            if (this.cell.ACLs[roleId]) {
                var actions = this.cell.ACLs[roleId].Actions;
                this.cell.ACLs[roleId].Actions = actions.filter(function (action) {
                    return action.Name !== right;
                });
                if (!this.cell.ACLs[roleId].Actions.length) {
                    this.removeUser(roleId);
                    return;
                }
            }
        }
        this.notifyDirty();
    };

    /**
     *
     * @param node Node
     * @param repositoryId String
     */

    CellModel.prototype.addRootNode = function addRootNode(node) {
        var repositoryId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var pydio = _pydio2['default'].getInstance();
        var treeNode = new _httpGenIndex.TreeNode();
        treeNode.Uuid = node.getMetadata().get('uuid');
        var slug = undefined;
        if (repositoryId) {
            slug = pydio.user.getRepositoriesList().get(repositoryId).getSlug();
        } else {
            slug = pydio.user.getActiveRepositoryObject().getSlug();
        }
        treeNode.Path = slug + node.getPath();
        treeNode.MetaStore = { selection: true };
        this.cell.RootNodes.push(treeNode);
        this.notifyDirty();
    };

    /**
     *
     * @param uuid string
     */

    CellModel.prototype.removeRootNode = function removeRootNode(uuid) {
        var newNodes = [];
        this.cell.RootNodes.map(function (n) {
            if (n.Uuid !== uuid) {
                newNodes.push(n);
            }
        });
        this.cell.RootNodes = newNodes;
        this.notifyDirty();
    };

    /**
     *
     * @param nodeId
     * @return bool
     */

    CellModel.prototype.hasRootNode = function hasRootNode(nodeId) {
        return this.cell.RootNodes.filter(function (root) {
            return root.Uuid === nodeId;
        }).length;
    };

    /**
     * Check if there are differences between current root nodes and original ones
     * @return {boolean}
     */

    CellModel.prototype.hasDirtyRootNodes = function hasDirtyRootNodes() {
        var _this3 = this;

        if (!this.originalCell) {
            return false;
        }
        var newNodes = [],
            deletedNodes = [];
        this.cell.RootNodes.map(function (n) {
            if (_this3.originalCell.RootNodes.filter(function (root) {
                return root.Uuid === n.Uuid;
            }).length === 0) {
                newNodes.push(n.Uuid);
            }
        });
        this.originalCell.RootNodes.map(function (n) {
            if (_this3.cell.RootNodes.filter(function (root) {
                return root.Uuid === n.Uuid;
            }).length === 0) {
                deletedNodes.push(n.Uuid);
            }
        });
        return newNodes.length > 0 || deletedNodes.length > 0;
    };

    /**
     *
     * @param roomLabel
     */

    CellModel.prototype.setLabel = function setLabel(roomLabel) {
        this.cell.Label = roomLabel;
        this.notifyDirty();
    };

    /**
     *
     * @return {String}
     */

    CellModel.prototype.getLabel = function getLabel() {
        return this.cell.Label;
    };

    /**
     *
     * @return {String}
     */

    CellModel.prototype.getDescription = function getDescription() {
        return this.cell.Description;
    };

    /**
     *
     * @return {String}
     */

    CellModel.prototype.getUuid = function getUuid() {
        return this.cell.Uuid;
    };

    /**
     *
     * @param description
     */

    CellModel.prototype.setDescription = function setDescription(description) {
        this.cell.Description = description;
        this.notifyDirty();
    };

    CellModel.prototype.clone = function clone(room) {
        return _httpGenIndex.RestCell.constructFromObject(JSON.parse(JSON.stringify(room)));
    };

    /**
     * @return {Promise}
     */

    CellModel.prototype.save = function save() {
        var _this4 = this;

        if (!this.cell.RootNodes.length && this.cell.Uuid) {
            // cell was emptied, remove it
            return this.deleteCell('This cell has no more items in it, it will be deleted, are you sure?');
        }

        var api = new _httpGenIndex.ShareServiceApi(_httpPydioApi2['default'].getRestClient());
        var request = new _httpGenIndex.RestPutCellRequest();
        if (!this._edit && !this.cell.RootNodes.length) {
            request.CreateEmptyRoot = true;
        }
        this.cell.RootNodes.map(function (node) {
            if (node.MetaStore && node.MetaStore.selection) {
                delete node.MetaStore.selection;
            }
        });
        request.Room = this.cell;
        return api.putCell(request).then(function (response) {
            if (!response || !response.Uuid) {
                throw new Error('Error while saving cell');
            }
            if (_this4._edit) {
                _this4.cell = response;
                _this4.dirty = false;
                _this4.originalCell = _this4.clone(_this4.cell);
                _this4.notify('update');
            } else {
                _pydio2['default'].getInstance().observeOnce('repository_list_refreshed', function () {
                    _pydio2['default'].getInstance().triggerRepositoryChange(response.Uuid);
                });
            }
        });
    };

    CellModel.prototype.load = function load(cellId) {
        var _this5 = this;

        var api = new _httpGenIndex.ShareServiceApi(_httpPydioApi2['default'].getRestClient());
        return api.getCell(cellId).then(function (room) {
            _this5.cell = room;
            if (!_this5.cell.RootNodes) {
                _this5.cell.RootNodes = [];
            }
            if (!_this5.cell.ACLs) {
                _this5.cell.ACLs = {};
            }
            if (!_this5.cell.Policies) {
                _this5.cell.Policies = [];
            }
            if (!_this5.cell.Description) {
                _this5.cell.Description = '';
            }
            _this5._edit = true;
            _this5.originalCell = _this5.clone(_this5.cell);
            _this5.notify('update');
        });
    };

    /**
     * @param confirmMessage String
     * @return {Promise}
     */

    CellModel.prototype.deleteCell = function deleteCell() {
        var _this6 = this;

        var confirmMessage = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        if (!confirmMessage) {
            confirmMessage = 'Are you sure you want to delete this cell? This cannot be undone.';
        }
        if (confirm(confirmMessage)) {
            var _ret = (function () {
                var api = new _httpGenIndex.ShareServiceApi(_httpPydioApi2['default'].getRestClient());
                var pydio = _pydio2['default'].getInstance();
                if (pydio.user.activeRepository === _this6.cell.Uuid) {
                    (function () {
                        var switchToOther = undefined;
                        pydio.user.getRepositoriesList().forEach(function (v, k) {
                            if (k !== _this6.cell.Uuid && (!switchToOther || v.getAccessType() === 'gateway')) {
                                switchToOther = k;
                            }
                        });
                        if (switchToOther) {
                            pydio.triggerRepositoryChange(switchToOther, function () {
                                api.deleteCell(_this6.cell.Uuid).then(function (res) {});
                            });
                        }
                    })();
                } else {
                    return {
                        v: api.deleteCell(_this6.cell.Uuid).then(function (res) {})
                    };
                }
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
        return Promise.resolve({});
    };

    return CellModel;
})(_langObservable2['default']);

exports['default'] = CellModel;
module.exports = exports['default'];
