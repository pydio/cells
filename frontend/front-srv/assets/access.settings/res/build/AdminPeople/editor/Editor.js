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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('./model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _modelUser = require('./model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _panelSharesList = require('./panel/SharesList');

var _panelSharesList2 = _interopRequireDefault(_panelSharesList);

var _aclWorkspacesAcls = require('./acl/WorkspacesAcls');

var _aclWorkspacesAcls2 = _interopRequireDefault(_aclWorkspacesAcls);

var _aclPagesAcls = require('./acl/PagesAcls');

var _aclPagesAcls2 = _interopRequireDefault(_aclPagesAcls);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilPath = require("pydio/util/path");

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _materialUi = require("material-ui");

var _infoRoleInfo = require('./info/RoleInfo');

var _infoRoleInfo2 = _interopRequireDefault(_infoRoleInfo);

var _infoUserInfo = require('./info/UserInfo');

var _infoUserInfo2 = _interopRequireDefault(_infoUserInfo);

var _infoGroupInfo = require('./info/GroupInfo');

var _infoGroupInfo2 = _interopRequireDefault(_infoGroupInfo);

var _paramsParametersPanel = require('./params/ParametersPanel');

var _paramsParametersPanel2 = _interopRequireDefault(_paramsParametersPanel);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;
var PaperEditorNavEntry = _Pydio$requireLib.PaperEditorNavEntry;
var PaperEditorNavHeader = _Pydio$requireLib.PaperEditorNavHeader;

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
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var _this2 = this;

            var _props = this.props;
            var node = _props.node;
            var idmRole = _props.idmRole;

            if (newProps.node !== node || newProps.idmRole !== idmRole) {
                if (newProps.node) {
                    this.setState(this.nodeToState(newProps.node));
                } else if (newProps.idmRole) {
                    this.setState({
                        idmRole: newProps.idmRole,
                        roleType: "role",
                        currentPane: 'info'
                    }, function () {
                        _this2.loadRoleData(true);
                    });
                }
            }
        }
    }, {
        key: 'nodeToState',
        value: function nodeToState(node) {
            var _this3 = this;

            var mime = node.getAjxpMime();
            var scope = mime === "group" ? "group" : "user";
            var observableUser = undefined;

            var idmUser = node.getMetadata().get("IdmUser");
            observableUser = new _modelUser2['default'](idmUser);
            observableUser.observe('update', function () {
                _this3.forceUpdate();
            });
            observableUser.load();

            return {
                observableUser: observableUser,
                roleLabel: _pydioUtilPath2['default'].getBasename(node.getPath()),
                roleType: scope,
                dirty: false,
                currentPane: 'info',
                localModalContent: {}
            };
        }
    }, {
        key: 'loadRoleData',
        value: function loadRoleData(showLoader) {
            var _this4 = this;

            if (showLoader) {
                this.setState({ loadingMessage: this.getMessage('home.6', 'ajxp_admin') });
            }
            var idmRole = this.state.idmRole;

            var role = new _modelRole2['default'](idmRole);
            role.load().then(function () {
                _this4.setState({ loadingMessage: null, observableRole: role });
                role.observe('update', function () {
                    _this4.forceUpdate();
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
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this5 = this;

            this.loadRoleData(true);
            if (this.props.registerCloseCallback) {
                this.props.registerCloseCallback(function () {
                    if (_this5.state && _this5.state.dirty && !global.confirm(_this5.getPydioRoleMessage('19'))) {
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
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props2 = this.props;
            var advancedAcl = _props2.advancedAcl;
            var pydio = _props2.pydio;
            var _state = this.state;
            var observableRole = _state.observableRole;
            var observableUser = _state.observableUser;
            var pluginsRegistry = _state.pluginsRegistry;
            var currentPane = _state.currentPane;
            var modal = _state.modal;

            var title = '',
                infoTitle = '';
            var infoMenuTitle = this.getMessage('24'); // user information
            var otherForm = undefined;
            var pagesShowSettings = false;

            if (this.state.roleType === 'user') {

                title = observableUser.getIdmUser().Login;
                pagesShowSettings = observableUser.getIdmUser().Attributes['profile'] === 'admin';
                otherForm = _react2['default'].createElement(_infoUserInfo2['default'], { user: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'group') {

                infoTitle = this.getMessage('26'); // group information
                infoMenuTitle = this.getMessage('27');
                title = observableUser.getIdmUser().GroupLabel;
                otherForm = _react2['default'].createElement(_infoGroupInfo2['default'], { group: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
            } else if (this.state.roleType === 'role') {

                title = observableRole ? observableRole.getIdmRole().Label : '...';
                infoTitle = this.getMessage('28'); // role information
                infoMenuTitle = this.getMessage('29');
                pagesShowSettings = true;
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
                        _this6.props.onRequestTabClose();
                    } })
            );

            var leftNav = [_react2['default'].createElement(PaperEditorNavHeader, { key: '1', label: this.getMessage('ws.28', 'ajxp_admin') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'info', keyName: 'info', onClick: this.setSelectedPane.bind(this), label: infoMenuTitle, selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '2', label: this.getMessage('34') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'workspaces', keyName: 'workspaces', onClick: this.setSelectedPane.bind(this), label: this.getMessage('35'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'pages', keyName: 'pages', onClick: this.setSelectedPane.bind(this), label: this.getMessage('36'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '3', label: this.getMessage('37') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'params', keyName: 'params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('38'), selectedKey: currentPane })];

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
                otherForm
            ));

            if (currentPane === 'workspaces') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'workspaces', className: classFor('workspaces'), style: styleFor('workspaces') },
                    _react2['default'].createElement(
                        'h3',
                        { className: 'paper-right-title' },
                        this.getRootMessage('250'),
                        _react2['default'].createElement(
                            'div',
                            { className: 'section-legend' },
                            this.getMessage('43')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'read-write-header' },
                            _react2['default'].createElement(
                                'span',
                                null,
                                'read'
                            ),
                            _react2['default'].createElement(
                                'span',
                                null,
                                'write'
                            ),
                            _react2['default'].createElement(
                                'span',
                                null,
                                'deny'
                            )
                        ),
                        _react2['default'].createElement('br', null)
                    ),
                    _react2['default'].createElement(_aclWorkspacesAcls2['default'], {
                        key: 'workspaces-list',
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType,
                        advancedAcl: advancedAcl,
                        showModal: this.showModal.bind(this),
                        hideModal: this.hideModal.bind(this)
                    })
                ));
            } else if (currentPane === 'pages') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'pages', className: classFor('pages'), style: styleFor('pages') },
                    _react2['default'].createElement(
                        'h3',
                        { className: 'paper-right-title' },
                        this.getMessage('44'),
                        _react2['default'].createElement(
                            'div',
                            { className: 'section-legend' },
                            this.getMessage('45')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { className: 'read-write-header' },
                            _react2['default'].createElement(
                                'span',
                                null,
                                'read'
                            ),
                            _react2['default'].createElement(
                                'span',
                                null,
                                'write'
                            ),
                            _react2['default'].createElement(
                                'span',
                                null,
                                'deny'
                            )
                        ),
                        _react2['default'].createElement('br', null)
                    ),
                    _react2['default'].createElement(_aclPagesAcls2['default'], {
                        key: 'pages-list',
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType,
                        advancedAcl: advancedAcl,
                        showModal: this.showModal.bind(this),
                        hideModal: this.hideModal.bind(this),
                        showSettings: pagesShowSettings
                    })
                ));
            } else if (currentPane === 'params') {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'params', className: classFor('params'), style: styleFor('params') },
                    _react2['default'].createElement(_paramsParametersPanel2['default'], {
                        pydio: pydio,
                        role: observableUser ? observableUser.getRole() : observableRole,
                        roleType: this.state.roleType
                    })
                ));
            }

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
