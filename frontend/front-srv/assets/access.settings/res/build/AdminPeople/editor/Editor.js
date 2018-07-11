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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('./model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _modelUser = require('./model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _userUserRolesPicker = require('./user/UserRolesPicker');

var _userUserRolesPicker2 = _interopRequireDefault(_userUserRolesPicker);

var _panelWorkspacesList = require('./panel/WorkspacesList');

var _panelWorkspacesList2 = _interopRequireDefault(_panelWorkspacesList);

var _panelSharesList = require('./panel/SharesList');

var _panelSharesList2 = _interopRequireDefault(_panelSharesList);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilPath = require("pydio/util/path");

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioModelRepository = require("pydio/model/repository");

var _pydioModelRepository2 = _interopRequireDefault(_pydioModelRepository);

var _materialUi = require("material-ui");

var _infoRoleInfo = require('./info/RoleInfo');

var _infoRoleInfo2 = _interopRequireDefault(_infoRoleInfo);

var _infoUserInfo = require('./info/UserInfo');

var _infoUserInfo2 = _interopRequireDefault(_infoUserInfo);

var _infoGroupInfo = require('./info/GroupInfo');

var _infoGroupInfo2 = _interopRequireDefault(_infoGroupInfo);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib2.PaperEditorLayout;
var PaperEditorNavEntry = _Pydio$requireLib2.PaperEditorNavEntry;
var PaperEditorNavHeader = _Pydio$requireLib2.PaperEditorNavHeader;

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props, context) {
        var _this = this;

        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), 'constructor', this).call(this, props, context);
        if (props.node) {
            this.state = this.nodeToState(props.node);
        } else if (props.idmRole) {
            this.state = {
                idmRole: props.idmRole,
                roleType: "role",
                currentPane: 'info'
            };
            this.loadRoleData(true);
        }
        var loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
        loader.loadPlugins().then(function (plugins) {
            _this.setState({ pluginsRegistry: plugins });
        });
    }

    _createClass(Editor, [{
        key: 'nodeToState',
        value: function nodeToState(node) {
            var _this2 = this;

            var mime = node.getAjxpMime();
            var scope = mime === "group" ? "group" : "user";
            var observableUser = undefined;

            var idmUser = node.getMetadata().get("IdmUser");
            observableUser = new _modelUser2['default'](idmUser);
            observableUser.observe('update', function () {
                _this2.forceUpdate();
            });
            observableUser.load();

            return {
                observableUser: observableUser,
                roleLabel: _pydioUtilPath2['default'].getBasename(node.getPath()),
                roleType: scope,
                dirty: false,
                currentPane: 'info',

                localModalContent: {},
                loadingMessage: this.getMessage('home.6', 'ajxp_admin')
            };
        }
    }, {
        key: 'loadRoleData',
        value: function loadRoleData(showLoader) {
            var _this3 = this;

            if (showLoader) {
                this.setState({ loadingMessage: this.getMessage('home.6', 'ajxp_admin') });
            }
            var idmRole = this.state.idmRole;

            var role = new _modelRole2['default'](idmRole);
            role.load().then(function () {
                _this3.setState({ loadingMessage: null, observableRole: role });
                role.observe('update', function () {
                    _this3.forceUpdate();
                });
            });
        }
    }, {
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
        key: 'setSelectedPane',
        value: function setSelectedPane(key) {
            this.setState({ currentPane: key });
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            /*
            var oldN = this.props.node ? this.props.node.getPath() : 'EMPTY';
            var newN = newProps.node ? newProps.node.getPath(): 'EMPTY';
            if(newN != oldN){
                this.setState(this.nodeToState(newProps.node), function(){
                    this.loadRoleData(true);
                }.bind(this));
            }
            */
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this4 = this;

            this.loadRoleData(true);
            if (this.props.registerCloseCallback) {
                this.props.registerCloseCallback(function () {
                    if (_this4.state && _this4.state.dirty && !global.confirm(_this4.getPydioRoleMessage('19'))) {
                        return false;
                    }
                });
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
                this.loadRoleData();
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
                add = _pydioUtilLang2['default'].arrayWithout(add, add.indexOf(previousRoles[i]));
            }
            for (i = 0; i < roles.length; i++) {
                remove = _pydioUtilLang2['default'].arrayWithout(remove, remove.indexOf(roles[i]));
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
                this.loadRoleData();
            }).bind(this));
        }
    }, {
        key: 'controllerGetBinaryContext',
        value: function controllerGetBinaryContext() {
            /*
            if(this.state.roleType == "user"){
                return "user_id="+this.state.roleId.replace("PYDIO_USR_/", "");
            }else if(this.state.roleType == "group"){
                return "group_id="+this.state.roleId.replace("PYDIO_GRP_/", "");
            }else{
                return "role_id="+this.state.roleId;
            }
            */
            return "";
        }
    }, {
        key: 'getController',
        value: function getController() {
            if (!this._controller) {
                var controller = {};
                controller.updateParameter = this.controllerUpdateParameter.bind(this);
                controller.updateAcl = this.controllerUpdateAcl.bind(this);
                controller.updateMask = this.controllerUpdateMask.bind(this);
                controller.updateUserProfile = this.controllerUpdateUserProfile.bind(this);
                controller.updateUserRoles = this.controllerUpdateUserRoles.bind(this);
                controller.orderUserRoles = this.controllerOrderUserRoles.bind(this);
                controller.getBinaryContext = this.controllerGetBinaryContext.bind(this);
                this._controller = controller;
            }
            return this._controller;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            var _props = this.props;
            var advancedAcl = _props.advancedAcl;
            var pydio = _props.pydio;
            var _state2 = this.state;
            var observableRole = _state2.observableRole;
            var observableUser = _state2.observableUser;
            var pluginsRegistry = _state2.pluginsRegistry;
            var currentPane = _state2.currentPane;
            var modal = _state2.modal;

            var filterPages = function filterPages(wsId, role) {
                return _pydioModelRepository2['default'].isInternal(wsId);
            };
            var filterNoPages = function filterNoPages(wsId, role) {
                return !_pydioModelRepository2['default'].isInternal(wsId) && wsId !== "pydiogateway";
            };

            var title = 'TITLE';
            var infoTitle = "";
            var infoMenuTitle = this.getMessage('24'); // user information
            var otherForm = undefined;

            if (this.state.roleType === 'user') {

                title = observableUser.getIdmUser().Login;
                otherForm = _react2['default'].createElement(_infoUserInfo2['default'], { user: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'group') {

                infoTitle = this.getMessage('26'); // group information
                infoMenuTitle = this.getMessage('27');
                title = observableUser.getIdmUser().GroupLabel;
                otherForm = _react2['default'].createElement(_infoGroupInfo2['default'], { group: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'role') {

                infoTitle = this.getMessage('28'); // role information
                infoMenuTitle = this.getMessage('29');
                otherForm = _react2['default'].createElement(_infoRoleInfo2['default'], { role: observableRole, pydio: pydio, pluginsRegistry: pluginsRegistry });
            }

            var saveDisabled = true;
            var save = function save() {},
                revert = function revert() {};
            if (observableUser) {
                saveDisabled = !observableUser.isDirty();
                save = function () {
                    observableUser.save();
                };
                revert = function () {
                    observableUser.revert();
                };
            } else if (observableRole) {
                saveDisabled = !observableRole.isDirty();
                save = function () {
                    observableRole.save();
                };
                revert = function () {
                    observableRole.revert();
                };
            }

            var rightButtons = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(_materialUi.FlatButton, { key: 'undo', disabled: saveDisabled, secondary: true, label: this.getMessage('plugins.6', 'ajxp_admin'), onTouchTap: revert }),
                _react2['default'].createElement(_materialUi.FlatButton, { key: 'save', disabled: saveDisabled, secondary: true, label: this.getRootMessage('53'), onTouchTap: save }),
                _react2['default'].createElement(_materialUi.RaisedButton, { key: 'close', label: this.getMessage('33'), onTouchTap: function () {
                        _this5.props.onRequestTabClose();
                    } })
            );

            var leftNav = [_react2['default'].createElement(PaperEditorNavHeader, { key: '1', label: this.getMessage('ws.28', 'ajxp_admin') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'info', keyName: 'info', onClick: this.setSelectedPane.bind(this), label: infoMenuTitle, selectedKey: this.state.currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '2', label: this.getMessage('34') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'workspaces', keyName: 'workspaces', onClick: this.setSelectedPane.bind(this), label: this.getMessage('35'), selectedKey: this.state.currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'pages', keyName: 'pages', onClick: this.setSelectedPane.bind(this), label: this.getMessage('36'), selectedKey: this.state.currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '3', label: this.getMessage('37') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'add-info', keyName: 'add-info', onClick: this.setSelectedPane.bind(this), label: this.getMessage('38'), selectedKey: this.state.currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'glob-params', keyName: 'global-params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('39'), selectedKey: this.state.currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'ws-params', keyName: 'ws-params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('40'), selectedKey: this.state.currentPane })];

            var panes = [];
            var classFor = function classFor(key) {
                return currentPane === key ? 'layout-fill' : '';
            };
            var styleFor = function styleFor(key) {
                return currentPane === key ? { overflow: 'auto' } : { height: 0, overflow: 'hidden' };
            };
            panes.push(_react2['default'].createElement(
                'div',
                { key: 'info', className: 'avatar-provider ' + classFor('info'), style: styleFor('info') },
                infoTitle && !this.state.loadingMessage ? _react2['default'].createElement(
                    'h3',
                    { className: 'paper-right-title' },
                    infoTitle
                ) : null,
                otherForm,
                _react2['default'].createElement(_panelWorkspacesList2['default'], {
                    key: 'global-scope',
                    roleRead: this.state.roleScope,
                    roleParent: this.state.roleParent,
                    roleType: this.state.roleType,
                    Controller: this.getController(),
                    showModal: this.showModal.bind(this),
                    hideModal: this.hideModal.bind(this),
                    globalData: {},
                    showGlobalScopes: { PYDIO_REPO_SCOPE_ALL: this.getPydioRoleMessage('12d') },
                    globalScopesFilterType: 'global',
                    initialEditCard: 'PYDIO_REPO_SCOPE_ALL',
                    noParamsListEdit: true,
                    editOnly: true,
                    displayFormPanel: true
                })
            ));
            /*
              panes.push(
                <div key="add-info" className={classFor('add-info')} style={styleFor('add-info')}>
                    <h3 className="paper-right-title">{this.getMessage('41')}
                        <div className="section-legend">{this.getMessage('42')}</div>
                    </h3>
                    <WorkspacesList {...this.state}
                                    key="global-all"
                                    showModal={this.showModal.bind(this)}
                                    hideModal={this.hideModal.bind(this)}
                                    globalData={this.state.roleData.ALL}
                                    showGlobalScopes={{PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d')}}
                                    globalScopesFilterType="global-noscope"
                                    initialEditCard="PYDIO_REPO_SCOPE_ALL"
                                    editOnly={true}
                                    roleType={this.state.roleType}
                    />
                </div>
            );
            panes.push(
                <div key="workspaces" className={classFor('workspaces')} style={styleFor('workspaces')}>
                    <h3 className="paper-right-title">
                        {this.getRootMessage('250')}
                        <div className="section-legend">{this.getMessage('43')}</div>
                        <div className="read-write-header">
                            <span>read</span>
                            <span>write</span>
                            <span>deny</span>
                        </div>
                        <br/>
                    </h3>
                    <WorkspacesList {...this.state}
                                    key="workspaces-list"
                                    listType="acl"
                                    roleType={this.state.roleType}
                                    advancedAcl={advancedAcl}
                                    showModal={this.showModal.bind(this)}
                                    hideModal={this.hideModal.bind(this)}
                                    globalData={this.state.roleData.ALL}
                                    filterCards={filterNoPages}/>
                </div>
            );
             panes.push(
                <div key="pages" className={classFor('pages')} style={styleFor('pages')}>
                    <h3 className="paper-right-title">{this.getMessage('44')}
                        <div className="section-legend">{this.getMessage('45')}</div>
                        <div className="read-write-header">
                            <span>{this.getMessage('react.5a', 'ajxp_admin')}</span>
                            <span>{this.getMessage('react.5b', 'ajxp_admin')}</span>
                            <span>{this.getMessage('react.5', 'ajxp_admin')}</span>
                        </div>
                        <br/>
                    </h3>
                    <WorkspacesList {...this.state}
                                    key="workspaces-pages"
                                    listType="acl"
                                    roleType={this.state.roleType}
                                    showModal={this.showModal.bind(this)}
                                    hideModal={this.hideModal.bind(this)}
                                    globalData={this.state.roleData.ALL}
                                    filterCards={filterPages}/>
                </div>
            );
            panes.push(
                <div key="global-params" className={classFor('global-params')} style={styleFor('global-params')}>
                    <h3 className="paper-right-title">{this.getMessage('46')}
                        <div className="section-legend">{this.getMessage('47')}</div>
                    </h3>
                    <WorkspacesList {...this.state}
                                    key="workspaces-global"
                                    roleType={this.state.roleType}
                                    showModal={this.showModal.bind(this)}
                                    hideModal={this.hideModal.bind(this)}
                                    globalData={this.state.roleData.ALL}
                                    showGlobalScopes={this.state.roleData.ALL?{
                                        PYDIO_REPO_SCOPE_ALL:this.getPydioRoleMessage('12d'),
                                        PYDIO_REPO_SCOPE_SHARED:this.getPydioRoleMessage('12e')
                                    }:{}}
                                    globalScopesFilterType="workspace"
                    />
                </div>
            );
            panes.push(
                <div key="ws-param" className={classFor('ws-param')} style={styleFor('ws-params')}>
                    <h3 className="paper-right-title">
                        {this.getMessage('40')}
                        <div className="section-legend">{this.getMessage('48')}</div>
                    </h3>
                    <WorkspacesList {...this.state}
                                    key="workspaces-list"
                                    listType="parameters"
                                    roleType={this.state.roleType}
                                    showModal={this.showModal.bind(this)}
                                    hideModal={this.hideModal.bind(this)}
                                    globalData={this.state.roleData.ALL}
                                    filterCards={filterNoPages}/>
                </div>
            );
             */

            var loadingMessage = null;
            if (this.state.loadingMessage) {
                loadingMessage = _react2['default'].createElement(
                    'div',
                    { className: 'loader-container layout-fill vertical-layout' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'loader-message', style: { margin: 'auto', color: 'rgba(0,0,0,0.33)', fontWeight: '500', fontSize: 16 } },
                        this.state.loadingMessage
                    )
                );
            }
            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: title,
                    titleActionBar: rightButtons,
                    contentFill: true,
                    leftNav: leftNav,
                    className: "edit-object-" + this.state.roleType
                },
                _react2['default'].createElement(_materialUi.Snackbar, {
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
})(_react2['default'].Component);

Editor.contextTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default'])
};

Editor.childContextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func,
    getPydioRoleMessage: _react2['default'].PropTypes.func,
    getRootMessage: _react2['default'].PropTypes.func
};

Editor.propTypes = {
    node: _react2['default'].PropTypes.instanceOf(AjxpNode),
    closeEditor: _react2['default'].PropTypes.func,
    registerCloseCallback: _react2['default'].PropTypes.func
};

exports['default'] = Editor;
module.exports = exports['default'];
