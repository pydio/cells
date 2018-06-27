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

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilEditorCache = require('./util/EditorCache');

var _utilEditorCache2 = _interopRequireDefault(_utilEditorCache);

var _userUserPasswordDialog = require('./user/UserPasswordDialog');

var _userUserPasswordDialog2 = _interopRequireDefault(_userUserPasswordDialog);

var _userUserRolesPicker = require('./user/UserRolesPicker');

var _userUserRolesPicker2 = _interopRequireDefault(_userUserRolesPicker);

var _panelWorkspacesList = require('./panel/WorkspacesList');

var _panelWorkspacesList2 = _interopRequireDefault(_panelWorkspacesList);

var _panelSharesList = require('./panel/SharesList');

var _panelSharesList2 = _interopRequireDefault(_panelSharesList);

var React = require('react');
var LangUtils = require('pydio/util/lang');
var PathUtils = require('pydio/util/path');
var Repository = require('pydio/model/repository');

var _require$requireLib = require('pydio').requireLib('form');

var FormPanel = _require$requireLib.FormPanel;

var _require$requireLib2 = require('pydio').requireLib('components');

var PaperEditorLayout = _require$requireLib2.PaperEditorLayout;
var PaperEditorNavEntry = _require$requireLib2.PaperEditorNavEntry;
var PaperEditorNavHeader = _require$requireLib2.PaperEditorNavHeader;

var _require = require('material-ui');

var FlatButton = _require.FlatButton;
var RaisedButton = _require.RaisedButton;
var Snackbar = _require.Snackbar;
var IconMenu = _require.IconMenu;
var IconButton = _require.IconButton;
var MenuItem = _require.MenuItem;

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props, context) {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props, context);
        this.state = this._nodeToState(props.node);
    }

    _createClass(Editor, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var messages = this.context.pydio.MessageHash;
            return {
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                },
                getPydioRoleMessage: function getPydioRoleMessage(messageId) {
                    return messages['role_editor.' + messageId] || messageId;
                },
                getRootMessage: function getRootMessage(messageId) {
                    return messages[messageId] || messageId;
                }
            };
        }
    }, {
        key: 'getMessage',
        value: function getMessage(messageId) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];

            return this.getChildContext().getMessage(messageId, namespace);
        }
    }, {
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            return this.getChildContext().getMessage(messageId, 'role_editor');
        }
    }, {
        key: 'getRootMessage',
        value: function getRootMessage(messageId) {
            return this.getChildContext().getMessage(messageId, '');
        }
    }, {
        key: '_loadRoleData',
        value: function _loadRoleData(showLoader) {
            if (showLoader) {
                this.setState({ loadingMessage: this.getMessage('home.6', 'ajxp_admin') });
            }
            PydioApi.getClient().request({
                get_action: "edit",
                sub_action: "edit_role",
                role_id: this.state.roleId,
                format: 'json'
            }, (function (transport) {
                //if(!this.isMounted()) return;
                this._loadPluginsDataToCache((function () {
                    this.setState({ loadingMessage: null });
                    this._parseRoleResponse(transport.responseJSON);
                }).bind(this));
            }).bind(this));
        }
    }, {
        key: '_parsePluginsDataForCache',
        value: function _parsePluginsDataForCache(response) {
            var map = new Map();
            for (var pluginName in response.LIST) {
                if (!response.LIST.hasOwnProperty(pluginName)) continue;
                var pData = response.LIST[pluginName];
                var submap = new Map();
                for (var key in pData) {
                    if (!pData.hasOwnProperty(key)) continue;
                    var entry = pData[key];
                    if (entry['action']) submap.set(entry['action'], { label: entry['label'] });else if (entry['parameter']) submap.set(entry['parameter'], entry['attributes']);
                }
                map.set(pluginName, submap);
            }
            return map;
        }
    }, {
        key: '_loadPluginsDataToCache',
        value: function _loadPluginsDataToCache(callback) {
            var _this = this;

            if (_utilEditorCache2['default'].CACHE) {
                callback();
            } else {
                (function () {
                    var client = PydioApi.getClient();
                    _utilEditorCache2['default'].CACHE = {};
                    _this.setState({ loadingMessage: _this.getMessage('22') });
                    client.request({ get_action: 'list_all_plugins_actions' }, (function (transport1) {
                        _utilEditorCache2['default'].CACHE['ACTIONS'] = this._parsePluginsDataForCache(transport1.responseJSON);
                        this.setState({ loadingMessage: this.getMessage('23') });
                        client.request({ get_action: 'list_all_plugins_parameters' }, (function (transport2) {
                            _utilEditorCache2['default'].CACHE['PARAMETERS'] = this._parsePluginsDataForCache(transport2.responseJSON);
                            callback();
                        }).bind(this));
                    }).bind(_this));
                    global.pydio.observe("admin_clear_plugins_cache", function () {
                        _utilEditorCache2['default'].CACHE = null;
                    });
                })();
            }
        }
    }, {
        key: '_scopeParamsToScope',
        value: function _scopeParamsToScope(roleData, roleRead) {
            var SCOPE = {};
            for (var key in roleData.SCOPE_PARAMS) {
                if (!roleData.SCOPE_PARAMS.hasOwnProperty(key)) continue;
                var param = roleData.SCOPE_PARAMS[key];
                var nameParts = param.name.split('/');
                var repoScope = nameParts[0];
                var pluginName = nameParts[1];
                var paramName = nameParts[2];
                if (!SCOPE[repoScope]) SCOPE[repoScope] = {};
                if (!SCOPE[repoScope][pluginName]) SCOPE[repoScope][pluginName] = {};
                var value;
                if (roleRead['PARAMETERS'][repoScope] && roleRead['PARAMETERS'][repoScope][pluginName] && roleRead['PARAMETERS'][repoScope][pluginName][paramName] !== undefined) {
                    value = roleRead['PARAMETERS'][repoScope][pluginName][paramName];
                } else {
                    value = param['default'] !== undefined ? param['default'] : '';
                    if (param.type == 'boolean') value = value == "true" || value === true;else if (param.type == 'integer') value = parseInt(value);
                }
                SCOPE[repoScope][pluginName][paramName] = value;
            }
            return { ACL: {}, ACTIONS: {}, PARAMETERS: SCOPE };
        }
    }, {
        key: '_parseRoleResponse',
        value: function _parseRoleResponse(roleData) {

            LangUtils.forceJSONArrayToObject(roleData.ROLE, "ACL");
            LangUtils.forceJSONArrayToObject(roleData.ROLE, "ACTIONS");
            LangUtils.forceJSONArrayToObject(roleData.ROLE, "PARAMETERS");

            var roleWrite = LangUtils.deepCopy(roleData.ROLE);
            var roleParent = {};
            if (roleData.PARENT_ROLE) {
                roleParent = roleData.PARENT_ROLE;
                LangUtils.forceJSONArrayToObject(roleParent, "ACL");
                LangUtils.forceJSONArrayToObject(roleParent, "ACTIONS");
                LangUtils.forceJSONArrayToObject(roleParent, "PARAMETERS");
            }
            var roleRead = this._recomputeRoleRead(roleParent, roleWrite);
            roleData.SCOPE = this._scopeParamsToScope(roleData, roleRead);
            this.setState({
                roleData: roleData,
                roleScope: roleData.SCOPE,
                roleParent: roleParent,
                roleWrite: roleWrite,
                roleRead: roleRead,
                dirty: false
            });
        }
    }, {
        key: '_recomputeRoleRead',
        value: function _recomputeRoleRead(roleParent, roleMain) {
            var skipSetState = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

            var roleRead = roleMain;
            if (roleParent) {
                roleRead = LangUtils.mergeObjectsRecursive(roleParent, roleMain);
            }
            if (!skipSetState) {
                this.setState({ roleRead: roleRead });
            }
            return roleRead;
        }
    }, {
        key: '_nodeToState',
        value: function _nodeToState(node) {
            var mime = node.getAjxpMime();
            var scope = mime;
            var roleId = undefined;
            if (mime == "role") {
                roleId = node.getMetadata().get("role_id");
            } else if (mime == "group") {
                roleId = "PYDIO_GRP_" + node.getPath().replace("/idm/users", "");
            } else if (mime == "user" || mime == "user_editable") {
                roleId = "PYDIO_USR_/" + PathUtils.getBasename(node.getPath());
                scope = "user";
            }
            return {
                roleId: roleId,
                roleLabel: PathUtils.getBasename(node.getPath()),
                roleType: scope,
                dirty: false,
                roleData: {},
                roleParent: {},
                roleWrite: {},
                roleRead: {},
                roleScope: {},
                localModalContent: {},
                currentPane: 'info',
                loadingMessage: this.getMessage('home.6', 'ajxp_admin'),
                Controller: this.getController()
            };
        }
    }, {
        key: '_toggleUserLock',
        value: function _toggleUserLock(userId, currentLock, buttonAction) {
            var reqParams = {
                get_action: "edit",
                sub_action: "user_set_lock",
                user_id: userId
            };
            if (buttonAction == "user_set_lock-lock") {
                reqParams["lock"] = currentLock.indexOf("logout") > -1 ? "false" : "true";
                reqParams["lock_type"] = "logout";
            } else {
                reqParams["lock"] = currentLock.indexOf("pass_change") > -1 ? "false" : "true";
                reqParams["lock_type"] = "pass_change";
            }
            PydioApi.getClient().request(reqParams, (function (transport) {
                this._loadRoleData();
            }).bind(this));
        }
    }, {
        key: 'setSelectedPane',
        value: function setSelectedPane(key) {
            this.setState({ currentPane: key });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var oldN = this.props.node ? this.props.node.getPath() : 'EMPTY';
            var newN = newProps.node ? newProps.node.getPath() : 'EMPTY';
            if (newN != oldN) {
                this.setState(this._nodeToState(newProps.node), (function () {
                    this._loadRoleData(true);
                }).bind(this));
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this._loadRoleData(true);
            if (this.props.registerCloseCallback) {
                this.props.registerCloseCallback((function () {
                    if (this.state && this.state.dirty && !global.confirm(this.getPydioRoleMessage('19'))) {
                        return false;
                    }
                }).bind(this));
            }
        }
    }, {
        key: 'showModal',
        value: function showModal(modal) {
            this.setState({ modal: modal });
        }
    }, {
        key: 'hideModal',
        value: function hideModal() {
            this.setState({ modal: null });
        }
    }, {
        key: 'updateRoleWrite',
        value: function updateRoleWrite(roleWrite) {
            var dirty = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            var roleRead = this._recomputeRoleRead(this.state.roleParent, roleWrite);
            this.setState({
                dirty: dirty,
                roleWrite: roleWrite,
                roleRead: roleRead,
                roleScope: this._scopeParamsToScope(this.state.roleData, roleRead)
            });
        }
    }, {
        key: 'resetRoleChanges',
        value: function resetRoleChanges() {
            this.updateRoleWrite(LangUtils.deepCopy(this.state.roleData.ROLE), false);
        }
    }, {
        key: 'saveRoleChanges',
        value: function saveRoleChanges() {
            var reload = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var jsonData = {
                ROLE: this.state.roleWrite,
                METADATA: this.state.parametersMetaData || {}
            };
            if (this.state.roleWrite.USER) {
                jsonData["USER"] = this.state.roleWrite.USER;
            } else if (this.state.roleWrite.GROUP && this.state.roleWrite.GROUP.LABEL) {
                jsonData["GROUP_LABEL"] = this.state.roleWrite.GROUP.LABEL;
            } else if (this.state.roleWrite.LABEL) {
                jsonData["ROLE_LABEL"] = this.state.roleWrite.LABEL;
            }

            PydioApi.getClient().request({
                get_action: 'edit',
                sub_action: 'post_json_role',
                role_id: this.state.roleId,
                json_data: JSON.stringify(jsonData)
            }, (function (transport) {
                this.logAction(this.getPydioRoleMessage('20'));
                if (reload) {
                    this._loadRoleData();
                } else {
                    this.setState({ dirty: false });
                }
                if (this.props.node.getParent()) {
                    this.props.node.getParent().reload();
                }
            }).bind(this));
        }
    }, {
        key: 'logAction',
        value: function logAction(message) {
            this.setState({ snackbar: message, snackOpen: true });
        }
    }, {
        key: 'hideSnackBar',
        value: function hideSnackBar() {
            this.setState({ snackOpen: false });
        }
    }, {
        key: 'controllerUpdateParameter',
        value: function controllerUpdateParameter(type, crudAction, scope, pluginName, paramName, paramValue) {
            var additionalFormData = arguments.length <= 6 || arguments[6] === undefined ? null : arguments[6];

            var role = this.state.roleWrite;
            var metaData = this.state.parametersMetaData || { PARAMETERS: {}, ACTIONS: {} };
            var key = type == 'parameter' ? 'PARAMETERS' : 'ACTIONS';
            if (crudAction == 'add' || crudAction == 'update') {
                if (!role[key]) role[key] = {};
                if (!role[key][scope]) role[key][scope] = {};
                if (!role[key][scope][pluginName]) role[key][scope][pluginName] = {};
                role[key][scope][pluginName][paramName] = crudAction == 'add' ? paramValue !== undefined ? paramValue : '' : paramValue;
                if (additionalFormData) {
                    additionalFormData['ajxp_form_element'] = paramName;
                    if (!metaData[key][scope]) metaData[key][scope] = {};
                    if (!metaData[key][scope][pluginName]) metaData[key][scope][pluginName] = {};
                    metaData[key][scope][pluginName][paramName] = additionalFormData;
                    //this.setState({parametersMetaData:metaData});
                }
                this.updateRoleWrite(role);
            } else if (crudAction == 'delete') {
                try {
                    var _parent = role[key][scope][pluginName];
                    if (_parent) {
                        delete _parent[paramName];
                        this.updateRoleWrite(role);
                    }
                } catch (e) {}
            }
            if (additionalFormData && additionalFormData['type']) {
                // Trigger save now for uploaded images
                this.setState({ parametersMetaData: metaData }, (function () {
                    this.saveRoleChanges(true);
                }).bind(this));
            }
        }
    }, {
        key: 'controllerUpdateAcl',
        value: function controllerUpdateAcl(scope, acl) {
            var role = this.state.roleWrite;
            if (role.ACL) {
                role.ACL[scope] = acl;
                this.updateRoleWrite(role);
            }
        }
    }, {
        key: 'controllerUpdateMask',
        value: function controllerUpdateMask(mask) {
            var role = this.state.roleWrite;
            if (role['NODES']) {
                role['NODES'] = mask;
                this.updateRoleWrite(role);
            }
        }
    }, {
        key: 'controllerUpdateUserProfile',
        value: function controllerUpdateUserProfile(profile) {
            var role = this.state.roleWrite;
            if (!role.USER) role.USER = this.state.roleData.USER;
            role.USER.PROFILE = profile;
            this.updateRoleWrite(role);
        }
    }, {
        key: 'controllerOrderUserRoles',
        value: function controllerOrderUserRoles(roles) {
            var _state = this.state;
            var roleId = _state.roleId;
            var roleData = _state.roleData;

            var currentUserId = roleId.replace("PYDIO_USR_/", "");
            var stateRoles = [];
            roleData.USER.ROLES.map(function (r) {
                var crtDetail = roleData.USER.ROLES_DETAILS[r] || { label: r };
                if (crtDetail.groupRole || crtDetail.userRole) {
                    stateRoles.push(r);
                }
            });
            stateRoles = stateRoles.concat(roles);
            roleData.USER.ROLES = stateRoles;
            PydioApi.getClient().request({
                get_action: "edit",
                sub_action: "user_reorder_roles",
                user_id: currentUserId,
                roles: JSON.stringify(roles)
            }, (function (transport) {
                this._loadRoleData();
            }).bind(this));
        }
    }, {
        key: 'controllerUpdateUserRoles',
        value: function controllerUpdateUserRoles(roles) {

            var currentUserId = this.state.roleId.replace("PYDIO_USR_/", "");
            var previousRoles = this.state.roleData.USER.ROLES || [];
            var remove = previousRoles.slice(0),
                add = roles.slice(0);
            for (var i = 0; i < previousRoles.length; i++) {
                add = LangUtils.arrayWithout(add, add.indexOf(previousRoles[i]));
            }
            for (i = 0; i < roles.length; i++) {
                remove = LangUtils.arrayWithout(remove, remove.indexOf(roles[i]));
            }
            if (!add.length && !remove.length) return;

            var stateRoles = [];
            var crtDetails = this.state.roleData.USER.ROLES_DETAILS;
            this.state.roleData.USER.ROLES.map(function (r) {
                var crtDetail = crtDetails[r] || { label: r };
                if (crtDetail.groupRole || crtDetail.userRole) {
                    stateRoles.push(r);
                }
            });
            stateRoles = stateRoles.concat(roles);
            this.state.roleData.USER.ROLES = stateRoles;

            var jsonData = { users: [currentUserId], roles: { add: add, remove: remove } };
            PydioApi.getClient().request({
                get_action: "edit",
                sub_action: "users_bulk_update_roles",
                json_data: JSON.stringify(jsonData)
            }, (function (transport) {
                this._loadRoleData();
            }).bind(this));
        }
    }, {
        key: 'controllerGetBinaryContext',
        value: function controllerGetBinaryContext() {
            if (this.state.roleType == "user") {
                return "user_id=" + this.state.roleId.replace("PYDIO_USR_/", "");
            } else if (this.state.roleType == "group") {
                return "group_id=" + this.state.roleId.replace("PYDIO_GRP_/", "");
            } else {
                return "role_id=" + this.state.roleId;
            }
        }
    }, {
        key: 'getController',
        value: function getController() {
            var controller = {};
            controller.updateParameter = this.controllerUpdateParameter.bind(this);
            controller.updateAcl = this.controllerUpdateAcl.bind(this);
            controller.updateMask = this.controllerUpdateMask.bind(this);
            controller.updateUserProfile = this.controllerUpdateUserProfile.bind(this);
            controller.updateUserRoles = this.controllerUpdateUserRoles.bind(this);
            controller.orderUserRoles = this.controllerOrderUserRoles.bind(this);
            controller.getBinaryContext = this.controllerGetBinaryContext.bind(this);
            return controller;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var advancedAcl = this.props.advancedAcl;

            var filterPages = function filterPages(wsId, role) {
                return Repository.isInternal(wsId);
            };
            var filterNoPages = function filterNoPages(wsId, role) {
                return !Repository.isInternal(wsId) && wsId !== "pydiogateway";
            };

            var title = PathUtils.getBasename(this.props.node.getPath());
            var infoTitle = "";
            var infoMenuTitle = this.getMessage('24'); // user information
            var testTitle;
            var defs, values, otherForm, changeListener;
            if (this.state.roleType === 'user' && this.state.roleData && this.state.roleData.ALL) {
                (function () {

                    try {
                        testTitle = _this2.state.roleRead['PARAMETERS']['PYDIO_REPO_SCOPE_ALL']['core.conf']['displayName'];
                        if (testTitle) {
                            title = testTitle;
                        }
                    } catch (e) {}
                    var userId = PathUtils.getBasename(_this2.props.node.getPath());
                    var locked = _this2.state.roleData.USER.LOCK || "";
                    var buttonCallback = function buttonCallback(action) {
                        if (action === "update_user_pwd") {
                            _this2.props.pydio.UI.openComponentInModal('AdminPeople', 'UserPasswordDialog', { userId: userId });
                        } else {
                            _this2._toggleUserLock(userId, locked, action);
                        }
                    };

                    otherForm = React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h3',
                            { className: "paper-right-title", style: { display: 'flex', alignItems: 'center' } },
                            React.createElement(
                                'div',
                                { style: { flex: 1 } },
                                _this2.getMessage('24'),
                                React.createElement(
                                    'div',
                                    { className: "section-legend" },
                                    _this2.getMessage('54')
                                )
                            ),
                            React.createElement(
                                IconMenu,
                                {
                                    iconButtonElement: React.createElement(IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                                    tooltip: "Actions"
                                },
                                React.createElement(MenuItem, { primaryText: _this2.getPydioRoleMessage('25'), onTouchTap: function () {
                                        return buttonCallback('update_user_pwd');
                                    } }),
                                React.createElement(MenuItem, { primaryText: _this2.getPydioRoleMessage(locked.indexOf('logout') > -1 ? '27' : '26'), onTouchTap: function () {
                                        return buttonCallback('user_set_lock-lock');
                                    } }),
                                React.createElement(MenuItem, { primaryText: _this2.getPydioRoleMessage(locked.indexOf('pass_change') > -1 ? '28b' : '28'), onTouchTap: function () {
                                        return buttonCallback('user_set_lock-pass_change');
                                    } })
                            )
                        )
                    );
                })();
            } else if (this.state.roleType === 'group') {

                // GROUP MAIN INFO
                infoTitle = this.getMessage('26'); // group information
                infoMenuTitle = this.getMessage('27');
                try {
                    testTitle = this.state.roleWrite.GROUP && this.state.roleWrite.GROUP.LABEL ? this.state.roleWrite.GROUP.LABEL : this.state.roleData.GROUP.LABEL;
                    if (testTitle) title = testTitle;
                } catch (e) {}

                if (this.state.roleData.GROUP) {
                    defs = [{ "name": "groupPath", label: this.getPydioRoleMessage('34'), "type": "string", readonly: true }, { "name": "groupLabel", label: this.getPydioRoleMessage('35'), "type": "string" }];
                    var label = this.state.roleWrite.GROUP && this.state.roleWrite.GROUP.LABEL ? this.state.roleWrite.GROUP.LABEL : this.state.roleData.GROUP.LABEL;
                    values = {
                        groupPath: this.state.roleData.GROUP.PATH || "/",
                        groupLabel: label
                    };
                    changeListener = (function (paramName, newValue, oldValue) {
                        if (!this.state.roleWrite.GROUP) this.state.roleWrite.GROUP = {};
                        this.state.roleWrite.GROUP.LABEL = newValue;
                        this.updateRoleWrite(this.state.roleWrite);
                    }).bind(this);
                    otherForm = React.createElement(FormPanel, {
                        key: 'form',
                        parameters: defs,
                        onParameterChange: changeListener,
                        values: values,
                        depth: -2
                    });
                }
            } else if (this.state.roleType === 'role') {

                // ROLE MAIN INFO
                infoTitle = this.getMessage('28'); // role information
                infoMenuTitle = this.getMessage('29');
                try {
                    testTitle = this.state.roleRead.LABEL;
                    if (testTitle) title = testTitle;
                } catch (e) {}

                if (this.state.roleData.ALL) {
                    defs = [{ "name": "roleId", label: this.getPydioRoleMessage('31'), "type": "string", readonly: true }, { "name": "roleLabel", label: this.getPydioRoleMessage('32'), "type": "string" }, { "name": "applies", label: this.getPydioRoleMessage('33'), "type": "select", multiple: true, choices: this.state.roleData.ALL.PROFILES.join(",") }];
                    values = {
                        roleId: this.state.roleId,
                        applies: LangUtils.objectValues(this.state.roleRead.APPLIES),
                        roleLabel: this.state.roleRead.LABEL
                    };
                    changeListener = (function (paramName, newValue, oldValue) {
                        if (paramName === "applies") {
                            this.state.roleWrite.APPLIES = newValue.split(',');
                        } else if (paramName === "roleLabel") {
                            this.state.roleWrite.LABEL = newValue;
                        }
                        this.updateRoleWrite(this.state.roleWrite);
                    }).bind(this);
                    otherForm = React.createElement(FormPanel, {
                        key: 'form',
                        parameters: defs,
                        onParameterChange: changeListener,
                        values: values,
                        depth: -2
                    });
                }
            }

            var crtPane = this.state.currentPane;
            var rolesPane, rolesPaneMenu;
            var shares, sharesMenu;
            if (this.state.roleType === 'user') {
                var filterUserId = PathUtils.getBasename(this.props.node.getPath());

                // PROFILES & ROLES PANE - SHARE PANE
                rolesPaneMenu = React.createElement(PydioComponents.PaperEditorNavEntry, { key: 'roles', keyName: 'roles', onClick: this.setSelectedPane.bind(this), label: this.getMessage('30'), selectedKey: this.state.currentPane });
                sharesMenu = React.createElement(PydioComponents.PaperEditorNavEntry, { key: 'shares', keyName: 'shares', onClick: this.setSelectedPane.bind(this), label: this.getMessage('49'), selectedKey: this.state.currentPane });
                if (this.state.roleData && this.state.roleData.ALL) {

                    defs = [{ name: "login", label: this.getPydioRoleMessage('21'), description: this.getMessage('31'), "type": "string", readonly: true }, { name: "profile", label: this.getPydioRoleMessage('22'), description: this.getMessage('32'), "type": "select", choices: this.state.roleData.ALL.PROFILES.join(",") }];
                    values = {
                        login: filterUserId,
                        profile: this.state.roleData.USER.PROFILE
                    };
                    changeListener = (function (paramName, newValue, oldValue) {
                        var controller = this.state.Controller;
                        if (paramName === "profile") {
                            controller.updateUserProfile(newValue);
                        }
                    }).bind(this);

                    rolesPane = React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'h3',
                            { className: 'paper-right-title' },
                            this.getMessage('30'),
                            React.createElement(
                                'div',
                                { className: "section-legend" },
                                this.getMessage('55')
                            )
                        ),
                        React.createElement(FormPanel, {
                            key: 'form',
                            parameters: defs,
                            onParameterChange: changeListener,
                            values: values,
                            depth: -2
                        }),
                        React.createElement(_userUserRolesPicker2['default'], {
                            availableRoles: this.state.roleData.ALL.ROLES,
                            rolesDetails: this.state.roleData.ALL.ROLES_DETAILS,
                            currentRoles: this.state.roleData.USER.ROLES,
                            currentRolesDetails: this.state.roleData.USER.ROLES_DETAILS,
                            controller: this.state.Controller,
                            loadingMessage: this.state.loadingMessage
                        })
                    );

                    if (this.state.currentPane === 'shares') {
                        var _props = this.props;
                        var node = _props.node;
                        var pydio = _props.pydio;

                        shares = React.createElement(_panelSharesList2['default'], {
                            pydio: pydio,
                            userId: filterUserId,
                            userData: this.state.roleData.USER
                        });
                    } else {
                        shares = React.createElement('div', null);
                    }
                }
            }

            var changes = !this.state.dirty;
            var save = (function () {
                this.saveRoleChanges();
            }).bind(this);
            var close = function close() {
                _this2.props.onRequestTabClose();
            };
            var rightButtons = React.createElement(
                'div',
                null,
                React.createElement(FlatButton, { key: 'undo', disabled: changes, secondary: true, label: this.getMessage('plugins.6', 'ajxp_admin'), onTouchTap: this.resetRoleChanges.bind(this) }),
                React.createElement(FlatButton, { key: 'save', disabled: changes, secondary: true, label: this.getRootMessage('53'), onTouchTap: save }),
                React.createElement(RaisedButton, { key: 'close', label: this.getMessage('33'), onTouchTap: close })
            );

            var leftNav = [React.createElement(PaperEditorNavHeader, { key: '1', label: this.getMessage('ws.28', 'ajxp_admin') }), React.createElement(PaperEditorNavEntry, { key: 'info', keyName: 'info', onClick: this.setSelectedPane.bind(this), label: infoMenuTitle, selectedKey: this.state.currentPane }), rolesPaneMenu, sharesMenu, React.createElement(PaperEditorNavHeader, { key: '2', label: this.getMessage('34') }), React.createElement(PaperEditorNavEntry, { key: 'workspaces', keyName: 'workspaces', onClick: this.setSelectedPane.bind(this), label: this.getMessage('35'), selectedKey: this.state.currentPane }), React.createElement(PaperEditorNavEntry, { key: 'pages', keyName: 'pages', onClick: this.setSelectedPane.bind(this), label: this.getMessage('36'), selectedKey: this.state.currentPane }), React.createElement(PaperEditorNavHeader, { key: '3', label: this.getMessage('37') }), React.createElement(PaperEditorNavEntry, { key: 'add-info', keyName: 'add-info', onClick: this.setSelectedPane.bind(this), label: this.getMessage('38'), selectedKey: this.state.currentPane }), React.createElement(PaperEditorNavEntry, { key: 'glob-params', keyName: 'global-params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('39'), selectedKey: this.state.currentPane }), React.createElement(PaperEditorNavEntry, { key: 'ws-params', keyName: 'ws-params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('40'), selectedKey: this.state.currentPane })];

            var panes = [];
            var classFor = function classFor(key) {
                return crtPane === key ? 'layout-fill' : '';
            };
            var styleFor = function styleFor(key) {
                return crtPane === key ? { overflow: 'auto' } : { height: 0, overflow: 'hidden' };
            };
            if (rolesPane) {
                panes.push(React.createElement(
                    'div',
                    { key: 'roles', className: classFor('roles'), style: styleFor('roles') },
                    rolesPane
                ));
            }
            if (shares) {
                panes.push(React.createElement(
                    'div',
                    { key: 'shares', className: classFor('shares'), style: styleFor('shares') },
                    shares
                ));
            }
            panes.push(React.createElement(
                'div',
                { key: 'info', className: 'avatar-provider ' + classFor('info'), style: styleFor('info') },
                infoTitle && !this.state.loadingMessage ? React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    infoTitle
                ) : null,
                otherForm,
                React.createElement(_panelWorkspacesList2['default'], {
                    key: 'global-scope',
                    roleRead: this.state.roleScope,
                    roleParent: this.state.roleParent,
                    roleType: this.state.roleType,
                    Controller: this.state.Controller,
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    showGlobalScopes: { PYDIO_REPO_SCOPE_ALL: this.getPydioRoleMessage('12d') },
                    globalScopesFilterType: 'global',
                    initialEditCard: 'PYDIO_REPO_SCOPE_ALL',
                    noParamsListEdit: true,
                    editOnly: true,
                    displayFormPanel: true
                })
            ));
            panes.push(React.createElement(
                'div',
                { key: 'add-info', className: classFor('add-info'), style: styleFor('add-info') },
                React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    this.getMessage('41'),
                    React.createElement(
                        'div',
                        { className: 'section-legend' },
                        this.getMessage('42')
                    )
                ),
                React.createElement(_panelWorkspacesList2['default'], _extends({}, this.state, {
                    key: 'global-all',
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    showGlobalScopes: { PYDIO_REPO_SCOPE_ALL: this.getPydioRoleMessage('12d') },
                    globalScopesFilterType: 'global-noscope',
                    initialEditCard: 'PYDIO_REPO_SCOPE_ALL',
                    editOnly: true,
                    roleType: this.state.roleType
                }))
            ));
            panes.push(React.createElement(
                'div',
                { key: 'workspaces', className: classFor('workspaces'), style: styleFor('workspaces') },
                React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    this.getRootMessage('250'),
                    React.createElement(
                        'div',
                        { className: 'section-legend' },
                        this.getMessage('43')
                    ),
                    React.createElement(
                        'div',
                        { className: 'read-write-header' },
                        React.createElement(
                            'span',
                            null,
                            'read'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'write'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'deny'
                        )
                    ),
                    React.createElement('br', null)
                ),
                React.createElement(_panelWorkspacesList2['default'], _extends({}, this.state, {
                    key: 'workspaces-list',
                    listType: 'acl',
                    roleType: this.state.roleType,
                    advancedAcl: advancedAcl,
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    filterCards: filterNoPages }))
            ));

            panes.push(React.createElement(
                'div',
                { key: 'pages', className: classFor('pages'), style: styleFor('pages') },
                React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    this.getMessage('44'),
                    React.createElement(
                        'div',
                        { className: 'section-legend' },
                        this.getMessage('45')
                    ),
                    React.createElement(
                        'div',
                        { className: 'read-write-header' },
                        React.createElement(
                            'span',
                            null,
                            this.getMessage('react.5a', 'ajxp_admin')
                        ),
                        React.createElement(
                            'span',
                            null,
                            this.getMessage('react.5b', 'ajxp_admin')
                        ),
                        React.createElement(
                            'span',
                            null,
                            this.getMessage('react.5', 'ajxp_admin')
                        )
                    ),
                    React.createElement('br', null)
                ),
                React.createElement(_panelWorkspacesList2['default'], _extends({}, this.state, {
                    key: 'workspaces-pages',
                    listType: 'acl',
                    roleType: this.state.roleType,
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    filterCards: filterPages }))
            ));
            panes.push(React.createElement(
                'div',
                { key: 'global-params', className: classFor('global-params'), style: styleFor('global-params') },
                React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    this.getMessage('46'),
                    React.createElement(
                        'div',
                        { className: 'section-legend' },
                        this.getMessage('47')
                    )
                ),
                React.createElement(_panelWorkspacesList2['default'], _extends({}, this.state, {
                    key: 'workspaces-global',
                    roleType: this.state.roleType,
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    showGlobalScopes: this.state.roleData.ALL ? {
                        PYDIO_REPO_SCOPE_ALL: this.getPydioRoleMessage('12d'),
                        PYDIO_REPO_SCOPE_SHARED: this.getPydioRoleMessage('12e')
                    } : {},
                    globalScopesFilterType: 'workspace'
                }))
            ));
            panes.push(React.createElement(
                'div',
                { key: 'ws-param', className: classFor('ws-param'), style: styleFor('ws-params') },
                React.createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    this.getMessage('40'),
                    React.createElement(
                        'div',
                        { className: 'section-legend' },
                        this.getMessage('48')
                    )
                ),
                React.createElement(_panelWorkspacesList2['default'], _extends({}, this.state, {
                    key: 'workspaces-list',
                    listType: 'parameters',
                    roleType: this.state.roleType,
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: this.state.roleData.ALL,
                    filterCards: filterNoPages }))
            ));

            var modal = this.state.modal || null;
            var loadingMessage = null;
            if (this.state.loadingMessage) {
                loadingMessage = React.createElement(
                    'div',
                    { className: 'loader-container layout-fill vertical-layout' },
                    React.createElement(
                        'div',
                        { className: 'loader-message', style: { margin: 'auto', color: 'rgba(0,0,0,0.33)', fontWeight: '500', fontSize: 16 } },
                        this.state.loadingMessage
                    )
                );
            }
            return React.createElement(
                PaperEditorLayout,
                {
                    title: title,
                    titleActionBar: rightButtons,
                    contentFill: true,
                    leftNav: leftNav,
                    className: "edit-object-" + this.state.roleType
                },
                React.createElement(Snackbar, {
                    message: this.state.snackbar || "",
                    open: this.state.snackOpen,
                    autoHideDuration: 4000,
                    ref: 'snack',
                    action: 'Dismiss',
                    onRequestClose: this.hideSnackBar.bind(this)
                }),
                modal,
                loadingMessage,
                panes
            );
        }
    }]);

    return Editor;
})(React.Component);

Editor.contextTypes = {
    pydio: React.PropTypes.instanceOf(Pydio)
};

Editor.childContextTypes = {
    messages: React.PropTypes.object,
    getMessage: React.PropTypes.func,
    getPydioRoleMessage: React.PropTypes.func,
    getRootMessage: React.PropTypes.func
};

Editor.propTypes = {
    node: React.PropTypes.instanceOf(AjxpNode),
    closeEditor: React.PropTypes.func,
    registerCloseCallback: React.PropTypes.func
};

exports['default'] = Editor;
module.exports = exports['default'];
