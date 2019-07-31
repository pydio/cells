(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],2:[function(require,module,exports){
(function() {
  function getBytes() {
    try {
      // Modern Browser
      return Array.from(
        (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(16))
      );
    } catch (error) {
      // Legacy Browser, fallback to Math.random
      var ret = [];
      while (ret.length < 16) ret.push((Math.random() * 256) & 0xff);
      return ret;
    }
  }

  function m(v) {
    v = v.toString(16);
    if (v.length < 2) v = "0" + v;
    return v;
  }

  function genUUID() {
    var rnd = getBytes();
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd
      .map(m)
      .join("")
      .match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join("-");
  }

  var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  function isUUID(uuid) {
    return uuidPattern.test(uuid);
  }

  genUUID.valid = isUUID;

  // global
  if (window) {
    window.uuid4 = genUUID;
  }

  // Node-style CJS
  if (typeof module !== "undefined" && module.exports) {
    module.exports = genUUID;
  }

  // AMD - legacy
  if (typeof define === "function" && define.amd) {
    define([], function() {
      return genUUID;
    });
  }
})();

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'deleteAction',
        value: function deleteAction(manager, args) {

            var userSelection = undefined;
            if (args && args.length) {
                userSelection = args[0];
            } else {
                userSelection = pydio.getUserSelection();
            }

            var firstNode = userSelection.getUniqueNode();
            var meta = firstNode.getMetadata();
            var deleteMessageId = undefined;

            switch (meta.get('ajxp_mime')) {
                case 'user_editable':
                    deleteMessageId = 'settings.34';
                    break;
                case 'group':
                    deleteMessageId = 'settings.126';
                    break;
                default:
                    break;
            }

            var callback = function callback() {
                var proms = userSelection.getSelectedNodes().map(function (n) {
                    return _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteIdmUser(n.getMetadata().get('IdmUser'));
                });
                Promise.all(proms).then(function () {
                    if (firstNode.getParent()) {
                        firstNode.getParent().reload(null, true);
                    }
                });
            };

            pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
                message: MessageHash[deleteMessageId],
                validCallback: callback
            });
        }
    }, {
        key: 'applyDND',
        value: function applyDND(manager, dndActionParameter) {

            if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_CAN_DROP) {

                AdminComponents.DNDActionsManager.canDropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            } else if (dndActionParameter.getStep() === PydioComponents.DNDActionParameter.STEP_END_DRAG) {

                AdminComponents.DNDActionsManager.dropNodeOnNode(dndActionParameter.getSource(), dndActionParameter.getTarget());
            }
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api"}],4:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorEditor = require('../editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _materialUiStyles = require('material-ui/styles');

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _UsersSearchBox = require('./UsersSearchBox');

var _UsersSearchBox2 = _interopRequireDefault(_UsersSearchBox);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _Callbacks = require('./Callbacks');

var _Callbacks2 = _interopRequireDefault(_Callbacks);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var JobsStore = _Pydio$requireLib.JobsStore;

var Dashboard = _react2['default'].createClass({
    displayName: 'Dashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
        var _props = this.props;
        var currentNode = _props.currentNode;
        var dataModel = _props.dataModel;

        return {
            searchResultData: false,
            currentNode: currentNode,
            dataModel: dataModel,
            showAnon: false
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        var jStore = JobsStore.getInstance();
        this._jStoreObserver = function (jobId) {
            if (jobId && jobId.indexOf('delete-group-') === 0) {
                jStore.getJobs().then(function (jobs) {
                    try {
                        if (jobs.get(jobId).Tasks[0].Status === 'Finished') {
                            _this.reloadList();
                        }
                    } catch (e) {}
                });
            }
        };
        jStore.observe("tasks_updated", this._jStoreObserver);
    },

    componentWillUnmounnt: function componentWillUnmounnt() {
        JobsStore.getInstance().stopObserving("tasks_updated", this._jStoreObserver);
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (!this.state.searchResultData) {
            this.setState({
                currentNode: newProps.currentNode,
                dataModel: newProps.dataModel
            });
        }
    },

    reloadList: function reloadList() {
        if (this.refs["mainlist"]) {
            this.refs["mainlist"].reload();
        }
    },

    renderListUserAvatar: function renderListUserAvatar(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        var pydio = this.props.pydio;

        if (idmUser.Attributes && idmUser.Attributes['avatar']) {
            var imgSrc = pydio.Parameters.get('ENDPOINT_REST_API') + '/frontend/binaries/USER/' + idmUser.Login + '?' + idmUser.Attributes['avatar'] + '&dim=33';
            return _react2['default'].createElement('div', { style: {
                    width: 33,
                    height: 33,
                    backgroundImage: "url(" + imgSrc + ")",
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                    backgroundPosition: 'center',
                    margin: 16
                } });
        }
        var style = {
            backgroundColor: '#9e9e9e',
            color: 'white',
            borderRadius: '50%',
            margin: 16,
            width: 33,
            height: 33,
            fontSize: 18,
            padding: 6,
            textAlign: 'center'
        };
        var iconClass = node.isLeaf() ? "mdi mdi-account" : "mdi mdi-folder";
        return _react2['default'].createElement(_materialUi.FontIcon, { className: iconClass, style: style });
    },

    renderListEntryFirstLine: function renderListEntryFirstLine(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        var profile = idmUser.Attributes ? idmUser.Attributes['profile'] : '';
        var icons = [];
        var iconStyle = { display: 'inline-block', marginLeft: 5, fontSize: 14 };

        if (profile === 'shared') {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-share-variant", style: _extends({}, iconStyle, { color: '#009688' }), title: this.context.getMessage('user.13') }));
        } else if (profile === "admin") {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-security", style: _extends({}, iconStyle, { color: '#03a9f4' }) }));
        }
        if (idmUser.Attributes && idmUser.Attributes['locks'] && idmUser.Attributes['locks'].indexOf('logout') > -1) {
            icons.push(_react2['default'].createElement('span', { className: "mdi mdi-lock", style: _extends({}, iconStyle, { color: '#E53934' }) }));
        }

        return _react2['default'].createElement(
            'span',
            null,
            node.getLabel(),
            ' ',
            icons
        );
    },

    renderListEntrySecondLine: function renderListEntrySecondLine(node) {
        var idmUser = node.getMetadata().get('IdmUser');
        if (node.isLeaf()) {
            if (node.getPath() === '/idm/users') {
                // This is the Root Group
                return this.context.getMessage('user.8');
            }
            var strings = [];
            strings.push(idmUser.Login);
            var attributes = idmUser.Attributes || {};
            if (attributes['profile']) {
                strings.push("Profile " + attributes['profile']);
            }
            if (attributes['last_connection_readable']) {
                strings.push(this.context.getMessage('user.9') + ' ' + attributes['last_connection_readable']);
            }
            var roles = idmUser.Roles;
            if (roles && roles.length) {
                strings.push(this.context.getMessage('user.11').replace("%i", roles.length));
            }
            return strings.join(" - ");
        } else {
            return this.context.getMessage('user.12') + ': ' + node.getPath().replace('/idm/users', '');
        }
    },

    renderListEntrySelector: function renderListEntrySelector(node) {
        if (node.getPath() === '/idm/users') {
            return false;
        }
        return node.isLeaf();
    },

    displaySearchResults: function displaySearchResults(searchTerm, searchDataModel) {
        this.setState({
            searchResultTerm: searchTerm,
            searchResultData: {
                term: searchTerm,
                toggleState: this.hideSearchResults
            },
            currentNode: searchDataModel.getContextNode(),
            dataModel: searchDataModel
        });
    },

    hideSearchResults: function hideSearchResults() {
        this.setState({
            searchResultData: false,
            currentNode: this.props.currentNode,
            dataModel: this.props.dataModel
        });
    },

    createUserAction: function createUserAction() {
        pydio.UI.openComponentInModal('AdminPeople', 'CreateUserForm', { dataModel: this.props.dataModel, openRoleEditor: this.openRoleEditor.bind(this) });
    },

    createGroupAction: function createGroupAction() {
        pydio.UI.openComponentInModal('AdminPeople', 'CreateRoleOrGroupForm', { type: 'group', openRoleEditor: this.openRoleEditor.bind(this) });
    },

    openUsersImporter: function openUsersImporter() {
        pydio.UI.openComponentInModal('EnterprisePeople', 'UsersImportDialog', { dataModel: this.props.dataModel });
    },

    openRoleEditor: function openRoleEditor(node) {
        var _this2 = this;

        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props2 = this.props;
        var advancedAcl = _props2.advancedAcl;
        var pydio = _props2.pydio;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        var editorData = {
            COMPONENT: _editorEditor2['default'],
            PROPS: {
                ref: "editor",
                node: node,
                pydio: pydio,
                initialEditSection: initialSection,
                onRequestTabClose: this.closeRoleEditor,
                advancedAcl: advancedAcl,
                afterSave: function afterSave() {
                    _this2.reloadList();
                }
            }
        };
        this.props.openRightPane(editorData);
    },

    closeRoleEditor: function closeRoleEditor() {
        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
    },

    deleteAction: function deleteAction(node) {
        var dm = new _pydioModelDataModel2['default']();
        dm.setSelectedNodes([node]);
        _Callbacks2['default'].deleteAction(null, [dm]);
    },

    renderNodeActions: function renderNodeActions(node) {
        var _this3 = this;

        var mime = node.getAjxpMime();
        var iconStyle = {
            color: 'rgba(0,0,0,0.43)',
            fontSize: 20
        };
        var disabledStyle = {
            color: 'rgba(0,0,0,0.15)',
            fontSize: 20
        };
        var actions = [];
        if (mime === 'user_editable' || mime === 'group') {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'edit', iconClassName: 'mdi mdi-pencil', onTouchTap: function () {
                    _this3.openRoleEditor(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', onTouchTap: function () {
                    _this3.deleteAction(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
        } else if (mime === 'user') {
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'edit', iconClassName: 'mdi mdi-pencil', onTouchTap: function () {
                    _this3.openRoleEditor(node);
                }, onClick: function (e) {
                    e.stopPropagation();
                }, iconStyle: iconStyle }));
            actions.push(_react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', disabled: true, iconStyle: disabledStyle, onClick: function (e) {
                    e.stopPropagation();
                } }));
        }
        return _react2['default'].createElement(
            'div',
            null,
            actions
        );
    },

    /**
     * Filter nodes
     * @param node
     * @return {boolean}
     */
    filterNodes: function filterNodes(node) {
        if (!node.getMetadata().has("IdmUser")) {
            return true;
        }
        var _state = this.state;
        var showAnon = _state.showAnon;
        var displaySearchResult = _state.displaySearchResult;

        if (displaySearchResult || showAnon) {
            return true;
        }
        var attributes = node.getMetadata().get("IdmUser").Attributes || {};
        return attributes['profile'] !== 'anon';
    },

    applyFilter: function applyFilter(profile) {
        var _this4 = this;

        if (profile === 'toggle-anon') {
            this.setState({ showAnon: !this.state.showAnon });
            return;
        }
        var currentNode = this.props.currentNode;

        currentNode.getMetadata().set('userProfileFilter', profile);
        currentNode.getMetadata()['delete']('paginationData');
        this.setState({ currentNode: currentNode }, function () {
            _this4.reloadList();
        });
    },

    render: function render() {
        var _this5 = this;

        var fontIconStyle = {
            style: {
                backgroundColor: this.props.muiTheme.palette.accent2Color,
                borderRadius: '50%',
                width: 36,
                height: 36,
                padding: 8,
                marginRight: 10
            },
            iconStyle: {
                color: 'white',
                fontSize: 20
            }
        };

        var _state2 = this.state;
        var searchResultData = _state2.searchResultData;
        var currentNode = _state2.currentNode;
        var dataModel = _state2.dataModel;
        var showAnon = _state2.showAnon;

        var importButton = _react2['default'].createElement(_materialUi.IconButton, _extends({}, fontIconStyle, { iconClassName: 'mdi mdi-file-excel', primary: false, tooltipPosition: "bottom-left", tooltip: this.context.getMessage('171', 'settings'), onTouchTap: this.openUsersImporter }));
        if (!_pydioHttpResourcesManager2['default'].moduleIsAvailable('EnterprisePeople')) {
            var disabled = { style: _extends({}, fontIconStyle.style), iconStyle: _extends({}, fontIconStyle.iconStyle) };
            disabled.style.backgroundColor = 'rgba(0,0,0,0.23)';
            importButton = _react2['default'].createElement(_materialUi.IconButton, _extends({}, disabled, { iconClassName: 'mdi mdi-file-excel', primary: false, tooltipPosition: "bottom-left", tooltip: this.context.getMessage('171', 'settings'), disabled: true }));
        }

        var searchBox = _react2['default'].createElement(_UsersSearchBox2['default'], {
            displayResults: this.displaySearchResults,
            displayResultsState: searchResultData,
            hideResults: this.hideSearchResults,
            style: { margin: '-18px 20px 0' },
            limit: 50,
            textLabel: this.context.getMessage('user.7'),
            className: "media-small-hide"
        });

        var headerButtons = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage("user.1"), onTouchTap: this.createUserAction }), _react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage("user.2"), onTouchTap: this.createGroupAction })];

        var groupHeaderStyle = {
            height: 48,
            lineHeight: '48px',
            backgroundColor: '#f5f5f5',
            color: '#9e9e9e',
            borderBottom: '1px solid rgb(228, 228, 228)',
            padding: '0 20px',
            fontSize: 12,
            fontWeight: 500
        };
        var groupPanelStyle = {
            flex: 'none'
        };
        if (searchResultData !== false) {
            groupPanelStyle = {
                flex: 'none',
                opacity: 0.6
            };
        }
        var profileFilter = '';
        if (currentNode.getMetadata().has('userProfileFilter')) {
            profileFilter = currentNode.getMetadata().get('userProfileFilter');
        }

        var iconColor = profileFilter === '' ? 'rgba(0,0,0,0.4)' : this.props.muiTheme.palette.accent1Color;
        var filterIcon = _react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { style: { marginRight: -16, marginLeft: 8 }, iconStyle: { color: iconColor }, iconClassName: "mdi mdi-filter-variant", tooltip: this.context.getMessage('user.filter.tooltip'), tooltipPosition: "bottom-left" }),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                value: profileFilter,
                onChange: function (e, val) {
                    _this5.applyFilter(val);
                },
                desktop: true
            },
            _react2['default'].createElement(_materialUi.MenuItem, { value: "", primaryText: this.context.getMessage('user.filter.all') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "!shared", primaryText: this.context.getMessage('user.filter.internal') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "shared", primaryText: this.context.getMessage('user.filter.shared') }),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "admin", primaryText: this.context.getMessage('user.filter.admins') }),
            _react2['default'].createElement(_materialUi.Divider, null),
            _react2['default'].createElement(_materialUi.MenuItem, { value: "toggle-anon", primaryText: this.context.getMessage('user.filter.anon'), secondaryText: showAnon ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        );

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('2', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: headerButtons,
                centerContent: searchBox
            }),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 16 }, className: "horizontal-layout layout-fill" },
                _react2['default'].createElement(
                    'div',
                    { className: 'hide-on-vertical-layout vertical-layout tab-vertical-layout people-tree', style: groupPanelStyle },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        _react2['default'].createElement(
                            'div',
                            { style: groupHeaderStyle },
                            this.context.getMessage("user.3")
                        ),
                        _react2['default'].createElement(PydioComponents.DNDTreeView, {
                            showRoot: true,
                            rootLabel: this.context.getMessage("user.5"),
                            node: this.props.rootNode,
                            dataModel: this.props.dataModel,
                            className: 'users-groups-tree',
                            paddingOffset: 10
                        })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { zDepth: 0, className: 'layout-fill vertical-layout people-list' },
                    _react2['default'].createElement(PydioComponents.SimpleList, {
                        ref: 'mainlist',
                        pydio: this.props.pydio,
                        node: currentNode,
                        dataModel: dataModel,
                        openEditor: this.openRoleEditor,
                        clearSelectionOnReload: false,
                        entryRenderIcon: this.renderListUserAvatar,
                        entryRenderFirstLine: this.renderListEntryFirstLine,
                        entryRenderSecondLine: this.renderListEntrySecondLine,
                        entryEnableSelector: this.renderListEntrySelector,
                        entryRenderActions: this.renderNodeActions,
                        searchResultData: searchResultData,
                        elementHeight: PydioComponents.SimpleList.HEIGHT_TWO_LINES,
                        hideToolbar: false,
                        toolbarStyle: { backgroundColor: '#f5f5f5', height: 48, borderBottom: '1px solid #e4e4e4' },
                        multipleActions: [this.props.pydio.Controller.getActionByName('delete')],
                        additionalActions: filterIcon,
                        filterNodes: this.filterNodes.bind(this)
                    })
                )
            )
        );
    }

});

exports['default'] = Dashboard = (0, _materialUiStyles.muiThemeable)()(Dashboard);
exports['default'] = Dashboard;
module.exports = exports['default'];

},{"../editor/Editor":8,"./Callbacks":3,"./UsersSearchBox":7,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","react":"react"}],5:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUiStyles = require('material-ui/styles');

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var _policiesPolicy = require('../policies/Policy');

var _policiesPolicy2 = _interopRequireDefault(_policiesPolicy);

var ResourceGroups = ["acl", "rest", "oidc"];

var PoliciesBoard = _react2['default'].createClass({
    displayName: 'PoliciesBoard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired,
        readonly: _react2['default'].PropTypes.bool
    },

    componentWillMount: function componentWillMount() {
        this.listPolicies();
    },

    getInitialState: function getInitialState() {
        return { policies: {}, popoverOpen: false, anchorEl: null };
    },

    groupByResourcesGroups: function groupByResourcesGroups(policies) {
        var result = [];
        ResourceGroups.map(function (k) {

            var groupPolicies = policies.PolicyGroups.filter(function (pol) {
                var g = pol.ResourceGroup || 'rest';
                return g === k;
            });
            if (groupPolicies.length) {
                groupPolicies.sort(function (a, b) {
                    return a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : a.Name.toLowerCase() === b.Name.toLowerCase() ? 0 : 1;
                });
                result[k] = groupPolicies;
            }
        });

        return result;
    },

    listPolicies: function listPolicies() {
        var _this = this;

        this.setState({ loading: true });
        var api = new _pydioHttpRestApi.PolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
        _pydio2['default'].startLoading();
        api.listPolicies(new _pydioHttpRestApi.IdmListPolicyGroupsRequest()).then(function (data) {
            _pydio2['default'].endLoading();
            var grouped = _this.groupByResourcesGroups(data);
            _this.setState({ policies: grouped, loading: false });
        })['catch'](function (reason) {
            _pydio2['default'].endLoading();
            _this.setState({ error: reason, loading: false });
        });
    },

    /**
     *
     * @param policy IdmPolicyGroup
     * @param revertOnly
     */
    savePolicy: function savePolicy(policy, revertOnly) {
        "use strict";

        var _this2 = this;

        if (revertOnly) {
            this.listPolicies();
            return;
        }
        _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
            var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.putPolicy(policy).then(function () {
                _this2.listPolicies();
            })['catch'](function (reason) {
                _this2.setState({ error: reason });
            });
        });
    },

    deletePolicy: function deletePolicy(policy) {
        "use strict";

        var _this3 = this;

        _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
            var api = new sdk.EnterprisePolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.deletePolicy(policy.Uuid).then(function () {
                _this3.listPolicies();
            })['catch'](function (reason) {
                _this3.setState({ error: reason });
            });
        });
    },

    createPolicy: function createPolicy(event) {
        var _refs = this.refs;
        var newPolicyName = _refs.newPolicyName;
        var newPolicyDescription = _refs.newPolicyDescription;
        var newPolicyType = this.state.newPolicyType;

        var newId = (0, _uuid42['default'])();

        var policy = {
            Uuid: newId,
            Name: newPolicyName.getValue(),
            Description: newPolicyDescription.getValue(),
            ResourceGroup: newPolicyType,
            Policies: []
        };

        var policies = _extends({}, this.state.policies);
        if (!policies[newPolicyType]) {
            policies[newPolicyType] = [];
        }
        policies[newPolicyType].push(policy);
        this.setState({
            policies: policies,
            popoverOpen: false,
            newPolicyId: newId
        });
    },

    openPopover: function openPopover(event) {
        "use strict";
        // This prevents ghost click.

        var _this4 = this;

        event.preventDefault();
        this.setState({
            newPolicyType: 'acl',
            popoverOpen: true,
            anchorEl: event.currentTarget
        }, function () {
            setTimeout(function () {
                _this4.refs.newPolicyName.focus();
            }, 200);
        });
    },

    handleRequestClose: function handleRequestClose() {
        this.setState({ popoverOpen: false });
    },

    handleChangePolicyType: function handleChangePolicyType(event, index, value) {
        this.setState({ newPolicyType: value });
    },

    render: function render() {
        var _this5 = this;

        var _props = this.props;
        var muiTheme = _props.muiTheme;
        var readonly = _props.readonly;
        var currentNode = _props.currentNode;
        var pydio = _props.pydio;
        var policies = this.state.policies;
        var primary1Color = muiTheme.palette.primary1Color;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.policies.' + id] || id;
        };

        //let items = [];

        var subheaderStyle = {
            textTransform: 'uppercase',
            fontSize: 12,
            color: primary1Color,
            paddingLeft: 20,
            paddingRight: 20
        };

        var lists = Object.keys(policies).map(function (k) {
            if (readonly && k === 'acl') {
                return null;
            }
            var title = m('type.' + k + '.title');
            var legend = m('type.' + k + '.legend');
            var data = policies[k];
            var items = [];
            data.map(function (policy) {
                items.push(_react2['default'].createElement(_policiesPolicy2['default'], _extends({}, _this5.props, {
                    key: policy.Name,
                    policy: policy,
                    savePolicy: _this5.savePolicy.bind(_this5),
                    deletePolicy: _this5.deletePolicy.bind(_this5),
                    newPolicyWithRule: _this5.state.newPolicyId === policy.Uuid ? policy.Name : null
                })));
                items.push(_react2['default'].createElement(_materialUi.Divider, null));
            });
            items.pop();
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    _materialUi.Subheader,
                    { style: subheaderStyle },
                    title
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    legend
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { margin: 16 } },
                    _react2['default'].createElement(
                        _materialUi.List,
                        null,
                        items
                    )
                )
            );
        });

        var action = _react2['default'].createElement(
            'div',
            null,
            _react2['default'].createElement(_materialUi.FlatButton, {
                primary: true,
                onTouchTap: this.openPopover.bind(this),
                label: m('policy.new')
            }),
            _react2['default'].createElement(
                _materialUi.Popover,
                {
                    open: this.state.popoverOpen,
                    anchorEl: this.state.anchorEl,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: this.handleRequestClose.bind(this)
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 12px' } },
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.name'), ref: 'newPolicyName' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('policy.description'), ref: 'newPolicyDescription' }),
                        _react2['default'].createElement('br', null),
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            {
                                floatingLabelText: m('policy.type'),
                                ref: 'newPolicyType',
                                value: this.state.newPolicyType || 'rest',
                                onChange: this.handleChangePolicyType.bind(this)
                            },
                            ResourceGroups.map(function (k) {
                                return _react2['default'].createElement(_materialUi.MenuItem, { value: k, primaryText: m('type.' + k + '.title') });
                            })
                        )
                    ),
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'right', padding: '6px 12px' } },
                        _react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: this.handleRequestClose.bind(this) }),
                        _react2['default'].createElement(_materialUi.FlatButton, { label: m('policy.create'), onTouchTap: this.createPolicy.bind(this) })
                    )
                )
            )
        );

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout', style: { height: '100%' } },
            _react2['default'].createElement(AdminComponents.Header, {
                title: currentNode.getLabel(),
                icon: currentNode.getMetadata().get('icon_class'),
                actions: readonly ? null : action,
                reloadAction: this.listPolicies.bind(this),
                loading: this.state.loading
            }),
            _react2['default'].createElement(
                'div',
                { className: 'layout-fill' },
                lists
            )
        );
    }

});

exports['default'] = PoliciesBoard = (0, _materialUiStyles.muiThemeable)()(PoliciesBoard);
exports['default'] = PoliciesBoard;
module.exports = exports['default'];

},{"../policies/Policy":33,"material-ui":"material-ui","material-ui/styles":"material-ui/styles","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","react":"react","uuid4":2}],6:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorEditor = require('../editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var RolesDashboard = _react2['default'].createClass({
    displayName: 'RolesDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {
            roles: [],
            loading: false,
            showTechnical: false
        };
    },

    load: function load() {
        var _this = this;

        var showTechnical = this.state.showTechnical;

        this.setState({ loading: true });
        _pydio2['default'].startLoading();
        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles(showTechnical, 0, 1000).then(function (roles) {
            _pydio2['default'].endLoading();
            _this.setState({ roles: roles, loading: false });
        })['catch'](function (e) {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
        });
    },

    componentDidMount: function componentDidMount() {
        this.load();
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.openRoleEditor(rows[0].role);
        }
    },

    openRoleEditor: function openRoleEditor(idmRole) {
        var initialSection = arguments.length <= 1 || arguments[1] === undefined ? 'activity' : arguments[1];
        var _props = this.props;
        var advancedAcl = _props.advancedAcl;
        var pydio = _props.pydio;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        var editorData = {
            COMPONENT: _editorEditor2['default'],
            PROPS: {
                ref: "editor",
                idmRole: idmRole,
                pydio: pydio,
                initialEditSection: initialSection,
                onRequestTabClose: this.closeRoleEditor,
                advancedAcl: advancedAcl
            }
        };
        this.props.openRightPane(editorData);
        return true;
    },

    closeRoleEditor: function closeRoleEditor() {
        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(this.props.pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        this.props.closeRightPane();
        return true;
    },

    deleteAction: function deleteAction(roleId) {
        var _this2 = this;

        var pydio = this.props.pydio;

        pydio.UI.openComponentInModal('PydioReactUI', 'ConfirmDialog', {
            message: pydio.MessageHash['settings.126'],
            validCallback: function validCallback() {
                _pydioHttpApi2['default'].getRestClient().getIdmApi().deleteRole(roleId).then(function () {
                    _this2.load();
                });
            }
        });
    },

    createRoleAction: function createRoleAction() {
        var _this3 = this;

        pydio.UI.openComponentInModal('AdminPeople', 'CreateRoleOrGroupForm', {
            type: 'role',
            roleNode: this.state.currentNode,
            openRoleEditor: this.openRoleEditor.bind(this),
            reload: function reload() {
                _this3.load();
            }
        });
    },

    computeTableData: function computeTableData(searchRoleString) {
        var roles = this.state.roles;

        var data = [];
        roles.map(function (role) {
            var label = role.Label;
            if (searchRoleString && label.toLowerCase().indexOf(searchRoleString.toLowerCase()) === -1) {
                return;
            }
            data.push({
                role: role,
                roleId: role.Uuid,
                roleLabel: label,
                isDefault: role.AutoApplies.join(', ') || '-',
                roleSummary: new Date(parseInt(role.LastUpdated) * 1000).toISOString()
            });
        });
        return data;
    },

    render: function render() {
        var _this4 = this;

        var _state = this.state;
        var searchRoleString = _state.searchRoleString;
        var showTechnical = _state.showTechnical;

        var buttons = [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: this.context.getMessage("user.6"), onClick: this.createRoleAction.bind(this) }), _react2['default'].createElement(
            _materialUi.IconMenu,
            {
                iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-filter-variant" }),
                anchorOrigin: { horizontal: 'right', vertical: 'top' },
                targetOrigin: { horizontal: 'right', vertical: 'top' },
                desktop: true,
                onChange: function () {
                    _this4.setState({ showTechnical: !showTechnical }, function () {
                        _this4.load();
                    });
                }
            },
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.hide', 'role_editor'), value: "hide", rightIcon: showTechnical ? null : _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) }),
            _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.context.getMessage('dashboard.technical.show', 'role_editor'), value: "show", rightIcon: showTechnical ? _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-check" }) : null })
        )];

        var centerContent = _react2['default'].createElement(
            'div',
            { style: { height: 40, padding: '0px 20px', width: 240, display: 'inline-block' } },
            _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, hintText: this.context.getMessage('47', 'role_editor') + '...', value: searchRoleString || '', onChange: function (e, v) {
                    return _this4.setState({ searchRoleString: v });
                } })
        );
        var iconStyle = {
            color: 'rgba(0,0,0,0.3)',
            fontSize: 20
        };
        var columns = [{ name: 'roleLabel', label: this.context.getMessage('32', 'role_editor'), style: { width: '35%', fontSize: 15 }, headerStyle: { width: '35%' } }, { name: 'roleSummary', label: this.context.getMessage('last_update', 'role_editor'), hideSmall: true }, { name: 'isDefault', label: this.context.getMessage('114', 'settings'), style: { width: '20%' }, headerStyle: { width: '20%' }, hideSmall: true }, { name: 'actions', label: '', style: { width: 80 }, headerStyle: { width: 80 }, renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { key: 'delete', iconClassName: 'mdi mdi-delete', onTouchTap: function () {
                        _this4.deleteAction(row.roleId);
                    }, onClick: function (e) {
                        e.stopPropagation();
                    }, iconStyle: iconStyle });
            } }];
        var data = this.computeTableData(searchRoleString);

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('69', 'settings'),
                icon: 'mdi mdi-account-multiple',
                actions: buttons,
                centerContent: centerContent,
                reloadAction: function () {
                    _this4.load();
                },
                loading: this.state.loading
            }),
            _react2['default'].createElement(AdminComponents.SubHeader, { legend: this.context.getMessage("dashboard.description", "role_editor") }),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 16 }, className: "horizontal-layout layout-fill" },
                _react2['default'].createElement(MaterialTable, {
                    data: data,
                    columns: columns,
                    onSelectRows: this.openTableRows.bind(this),
                    deselectOnClickAway: true,
                    showCheckboxes: false
                })
            )
        );
    }

});

exports['default'] = RolesDashboard;
module.exports = exports['default'];

},{"../editor/Editor":8,"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","react":"react"}],7:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

/**
 * Search input building a set of query parameters and calling
 * the callbacks to display / hide results
 */

var UsersSearchBox = (function (_React$Component) {
    _inherits(UsersSearchBox, _React$Component);

    function UsersSearchBox(props) {
        _classCallCheck(this, UsersSearchBox);

        _get(Object.getPrototypeOf(UsersSearchBox.prototype), 'constructor', this).call(this, props);
        var dm = new _pydioModelDataModel2['default']();
        dm.setRootNode(new _pydioModelNode2['default']());
        this.state = {
            dataModel: dm,
            displayResult: props.displayResultsState
        };
        this.searchDebounced = (0, _lodashDebounce2['default'])(this.triggerSearch, 350);
    }

    _createClass(UsersSearchBox, [{
        key: 'displayResultsState',
        value: function displayResultsState() {
            this.setState({
                displayResult: true
            });
        }
    }, {
        key: 'hideResultsState',
        value: function hideResultsState() {
            this.setState({
                displayResult: false
            });
            this.props.hideResults();
        }
    }, {
        key: 'triggerSearch',
        value: function triggerSearch() {
            var _this = this;

            var value = this.refs.query.getValue();
            if (!value) {
                this.hideResultsState();
                this.refs.query.blur();
                return;
            }
            var dm = this.state.dataModel;
            var limit = this.props.limit || 100;
            dm.getRootNode().setChildren([]);
            var p1 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listGroups('/', value, true, 0, limit);
            var p2 = _pydioHttpApi2['default'].getRestClient().getIdmApi().listUsers('/', value, true, 0, limit);
            Promise.all([p1, p2]).then(function (result) {
                var groups = result[0];
                var users = result[1];
                groups.Groups.map(function (group) {
                    var label = group.Attributes && group.Attributes['displayName'] ? group.Attributes['displayName'] : group.GroupLabel;
                    var gNode = new _pydioModelNode2['default']('/idm/users' + _pydioUtilLang2['default'].trimRight(group.GroupPath, '/') + '/' + group.GroupLabel, false, label);
                    gNode.getMetadata().set('IdmUser', group);
                    gNode.getMetadata().set('ajxp_mime', 'group');
                    dm.getRootNode().addChild(gNode);
                });
                users.Users.map(function (user) {
                    var label = user.Attributes && user.Attributes['displayName'] ? user.Attributes['displayName'] : user.Login;
                    var uNode = new _pydioModelNode2['default']('/idm/users' + user.Login, true, label);
                    uNode.getMetadata().set('IdmUser', user);
                    uNode.getMetadata().set('ajxp_mime', 'user_editable');
                    dm.getRootNode().addChild(uNode);
                });
                dm.getRootNode().setLoaded(true);
                _this.displayResultsState();
                _this.props.displayResults(value, dm);
            });
        }
    }, {
        key: 'keyDown',
        value: function keyDown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.triggerSearch();
            } else {
                this.searchDebounced();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: this.props.className ? this.props.className : '', style: _extends({ display: 'flex', alignItems: 'center', maxWidth: 220 }, this.props.style) },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    _react2['default'].createElement(
                        'form',
                        { autoComplete: "off" },
                        _react2['default'].createElement(_materialUi.TextField, { ref: 'query',
                            onKeyDown: this.keyDown.bind(this),
                            floatingLabelText: this.props.textLabel,
                            fullWidth: true,
                            floatingLabelStyle: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }
                        })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { paddingTop: 22, opacity: 0.3 } },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        ref: 'button',
                        onTouchTap: this.triggerSearch.bind(this),
                        iconClassName: 'mdi mdi-account-search',
                        tooltip: this.props.textLabel
                    })
                )
            );
        }
    }]);

    return UsersSearchBox;
})(_react2['default'].Component);

UsersSearchBox.PropTypes = {
    textLabel: _react2['default'].PropTypes.string,
    displayResults: _react2['default'].PropTypes.func,
    hideResults: _react2['default'].PropTypes.func,
    displayResultsState: _react2['default'].PropTypes.bool,
    limit: _react2['default'].PropTypes.number,
    style: _react2['default'].PropTypes.object
};

exports['default'] = UsersSearchBox;
module.exports = exports['default'];

},{"lodash.debounce":"lodash.debounce","material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","pydio/util/lang":"pydio/util/lang","react":"react"}],8:[function(require,module,exports){
(function (global){
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

var _infoUserActivity = require('./info/UserActivity');

var _infoUserActivity2 = _interopRequireDefault(_infoUserActivity);

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
            var activityTab = undefined;
            var pagesShowSettings = false;

            if (this.state.roleType === 'user') {

                var idmUser = observableUser.getIdmUser();
                title = idmUser.Attributes && idmUser.Attributes['displayName'] ? idmUser.Attributes['displayName'] : idmUser.Login;
                pagesShowSettings = idmUser.Attributes['profile'] === 'admin';
                otherForm = _react2['default'].createElement(_infoUserInfo2['default'], { user: observableUser, pydio: pydio, pluginsRegistry: pluginsRegistry });
                if (advancedAcl) {
                    activityTab = _react2['default'].createElement(PaperEditorNavEntry, { key: 'activity', keyName: 'activity', onClick: this.setSelectedPane.bind(this), label: "Recent Activity", selectedKey: currentPane });
                }
            } else if (this.state.roleType === 'group') {

                infoTitle = this.getMessage('26'); // group information
                infoMenuTitle = this.getMessage('27');
                title = observableUser.getIdmUser().GroupLabel;
                if (observableUser.getIdmUser().Attributes && observableUser.getIdmUser().Attributes['displayName']) {
                    title = observableUser.getIdmUser().Attributes['displayName'];
                }
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
                    observableUser.save().then(_this6.props.afterSave);
                };
                revert = function () {
                    observableUser.revert();
                };
            } else if (observableRole) {
                saveDisabled = !observableRole.isDirty();
                save = function () {
                    observableRole.save(_this6.props.afterSave);
                };
                revert = function () {
                    observableRole.revert();
                };
            }

            var rightButtons = [PaperEditorLayout.actionButton(this.getMessage('plugins.6', 'ajxp_admin'), "mdi mdi-undo", revert, saveDisabled), PaperEditorLayout.actionButton(this.getRootMessage('53'), "mdi mdi-content-save", save, saveDisabled)];

            var leftNav = [_react2['default'].createElement(PaperEditorNavHeader, { key: '1', label: this.getMessage('ws.28', 'ajxp_admin') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'info', keyName: 'info', onClick: this.setSelectedPane.bind(this), label: infoMenuTitle, selectedKey: currentPane }), activityTab, _react2['default'].createElement(PaperEditorNavHeader, { key: '2', label: this.getMessage('34') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'workspaces', keyName: 'workspaces', onClick: this.setSelectedPane.bind(this), label: this.getMessage('35'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'pages', keyName: 'pages', onClick: this.setSelectedPane.bind(this), label: this.getMessage('36'), selectedKey: currentPane }), _react2['default'].createElement(PaperEditorNavHeader, { key: '3', label: this.getMessage('37') }), _react2['default'].createElement(PaperEditorNavEntry, { key: 'params', keyName: 'params', onClick: this.setSelectedPane.bind(this), label: this.getMessage('38'), selectedKey: currentPane })];

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
                                { className: 'header-read' },
                                this.getMessage('react.5a', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-write' },
                                this.getMessage('react.5b', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-deny' },
                                this.getMessage('react.5', 'ajxp_admin')
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
                                { className: 'header-read' },
                                this.getMessage('react.5a', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-write' },
                                this.getMessage('react.5b', 'ajxp_admin')
                            ),
                            _react2['default'].createElement(
                                'span',
                                { className: 'header-deny' },
                                this.getMessage('react.5', 'ajxp_admin')
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
                        showSettings: pagesShowSettings,
                        pydio: pydio
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
            } else if (currentPane === 'activity' && observableUser) {
                panes.push(_react2['default'].createElement(
                    'div',
                    { key: 'activity', className: classFor('activity'), style: styleFor('activity') },
                    _react2['default'].createElement(_infoUserActivity2['default'], {
                        pydio: pydio,
                        user: observableUser
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
                    closeAction: function () {
                        _this6.props.onRequestTabClose();
                    },
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./acl/PagesAcls":10,"./acl/WorkspacesAcls":15,"./info/GroupInfo":16,"./info/RoleInfo":17,"./info/UserActivity":18,"./info/UserInfo":19,"./model/Role":20,"./model/User":21,"./params/ParametersPanel":25,"material-ui":"material-ui","pydio":"pydio","pydio/util/path":"pydio/util/path","react":"react"}],9:[function(require,module,exports){
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

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpRestApi = require('pydio/http/rest-api');

/**
 * Implementation of the IAjxpNodeProvider interface based on a remote server access.
 * Default for all repositories.
 */

var MaskNodesProvider = (function (_MetaNodeProvider) {
    _inherits(MaskNodesProvider, _MetaNodeProvider);

    function MaskNodesProvider() {
        _classCallCheck(this, MaskNodesProvider);

        _get(Object.getPrototypeOf(MaskNodesProvider.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MaskNodesProvider, [{
        key: 'loadNode',

        /**
         * Load a node
         * @param node AjxpNode
         * @param nodeCallback Function On node loaded
         * @param childCallback Function On child added
         * @param recursive
         * @param depth
         * @param optionalParameters
         */
        value: function loadNode(node) {
            var nodeCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
            var childCallback = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var recursive = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
            var depth = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];
            var optionalParameters = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

            //console.log('MaskNodes', node);
            var api = new _pydioHttpRestApi.AdminTreeServiceApi(_pydioHttpApi2['default'].getRestClient());

            var listRequest = new _pydioHttpRestApi.TreeListNodesRequest();
            listRequest.Node = _pydioHttpRestApi.TreeNode.constructFromObject({ Path: node.getPath() });
            api.listAdminTree(listRequest).then(function (nodesColl) {
                var children = nodesColl.Children || [];
                children.forEach(function (c) {
                    var nodeChild = undefined;
                    try {
                        nodeChild = _pydioModelMetaNodeProvider2['default'].parseTreeNode(c, null);
                    } catch (e) {
                        console.log(e);
                        return;
                    }
                    if (childCallback) {
                        childCallback(nodeChild);
                    }
                    node.addChild(nodeChild);
                });
                if (nodeCallback !== null) {
                    nodeCallback(node);
                }
            })['catch'](function () {});
        }
    }]);

    return MaskNodesProvider;
})(_pydioModelMetaNodeProvider2['default']);

exports['default'] = MaskNodesProvider;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/meta-node-provider":"pydio/model/meta-node-provider"}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var PagesAcls = (function (_React$Component) {
    _inherits(PagesAcls, _React$Component);

    function PagesAcls(props) {
        _classCallCheck(this, PagesAcls);

        _get(Object.getPrototypeOf(PagesAcls.prototype), 'constructor', this).call(this, props);
        var m = function m(id) {
            return props.pydio.MessageHash['pydio_role.' + id] || id;
        };

        var workspaces = [];
        var homepageWorkspace = new _pydioHttpRestApi.IdmWorkspace();
        homepageWorkspace.UUID = "homepage";
        homepageWorkspace.Label = m('workspace.statics.home.title');
        homepageWorkspace.Description = m('workspace.statics.home.description');
        homepageWorkspace.Slug = "homepage";
        homepageWorkspace.RootNodes = { "homepage-ROOT": _pydioHttpRestApi.TreeNode.constructFromObject({ Uuid: "homepage-ROOT" }) };
        workspaces.push(homepageWorkspace);
        if (props.showSettings) {
            var settingsWorkspace = new _pydioHttpRestApi.IdmWorkspace();
            settingsWorkspace.UUID = "settings";
            settingsWorkspace.Label = m('workspace.statics.settings.title');
            settingsWorkspace.Description = m('workspace.statics.settings.description');
            settingsWorkspace.Slug = "settings";
            settingsWorkspace.RootNodes = { "settings-ROOT": _pydioHttpRestApi.TreeNode.constructFromObject({ Uuid: "settings-ROOT" }) };
            workspaces.push(settingsWorkspace);
        }
        workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
        this.state = { workspaces: workspaces };
    }

    _createClass(PagesAcls, [{
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var workspaces = this.state.workspaces;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                workspaces.map(function (ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], {
                        workspace: ws,
                        role: role,
                        advancedAcl: false
                    });
                })
            );
        }
    }]);

    return PagesAcls;
})(_react2['default'].Component);

exports['default'] = PagesAcls;
module.exports = exports['default'];

},{"./WorkspaceAcl":14,"pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modelRole = require("../model/Role");

var _modelRole2 = _interopRequireDefault(_modelRole);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _classNames = require('classNames');

var _classNames2 = _interopRequireDefault(_classNames);

var _materialUi = require('material-ui');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _MaskNodesProvider = require('./MaskNodesProvider');

var _MaskNodesProvider2 = _interopRequireDefault(_MaskNodesProvider);

var PermissionMaskEditor = _react2['default'].createClass({
    displayName: 'PermissionMaskEditor',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        role: _react2['default'].PropTypes.instanceOf(_modelRole2['default']),
        workspace: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.IdmWorkspace),

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions: _react2['default'].PropTypes.object,
        showGlobalPermissions: _react2['default'].PropTypes.bool,
        onGlobalPermissionsChange: _react2['default'].PropTypes.func,

        /* Folders mask and parentMask */
        onNodesChange: _react2['default'].PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal: _react2['default'].PropTypes.func,
        hideModal: _react2['default'].PropTypes.func
    },

    dmObserver: function dmObserver() {
        var dataModel = this.state.dataModel;
        var sel = dataModel.getSelectedNodes();
        if (!sel.length) {
            return;
        }
        var selNode = sel[0];
        if (selNode.isLoaded()) {
            this.forceUpdate();
        } else {
            selNode.observeOnce("loaded", (function () {
                this.forceUpdate();
            }).bind(this));
            selNode.load();
        }
    },

    componentDidMount: function componentDidMount() {
        this.state.dataModel.setSelectedNodes([this.state.node]);
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (newProps.nodes !== this.state.nodes || newProps.parentNodes !== this.state.parentNodes) {
            this.setState({
                nodes: newProps.nodes,
                parentNodes: newProps.parentNodes || {}
            });
        }
    },

    recursiveLoadNodesWithChildren: function recursiveLoadNodesWithChildren(node, crtMask) {
        var afterLoad = function afterLoad(loadedNode) {
            "use strict";
            loadedNode.getChildren().forEach(function (c) {
                if (crtMask[c.getMetadata().get('uuid')] && crtMask[c.getMetadata().get('uuid')]['children']) {
                    c.observeOnce('loaded', function () {
                        afterLoad(c);
                    });
                    c.load();
                }
            });
        };
        if (node.isLoaded()) {
            afterLoad(node);
        } else {
            node.observeOnce('loaded', function () {
                afterLoad(node);
            });
            node.load();
        }
    },

    recursiveClearNodeValues: function recursiveClearNodeValues(node, values) {
        "use strict";

        var _this = this;

        node.getChildren().forEach(function (c) {
            if (values[c.getMetadata().get('uuid')]) {
                _this.recursiveClearNodeValues(c, values);
                delete values[c.getMetadata().get('uuid')];
            }
        });
    },

    getInitialState: function getInitialState() {
        var dataModel = new _pydioModelDataModel2['default'](true);
        var rNodeProvider = new _MaskNodesProvider2['default']();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        // Todo:  multiple roots
        var rootNodes = this.props.workspace.RootNodes;
        var firstNode = rootNodes[Object.keys(rootNodes).shift()];
        var rootNode = new _pydioModelNode2['default']("/" + firstNode.Path, false, this.context.getMessage('acls.rights.advanced.root'), "folder.png", rNodeProvider);
        rootNode.getMetadata().set("uuid", firstNode.Uuid);

        dataModel.setRootNode(rootNode);
        this.recursiveLoadNodesWithChildren(rootNode, this.props.nodes);
        dataModel.observe("selection_changed", this.dmObserver);

        return {
            node: rootNode,
            dataModel: dataModel,
            nodes: this.props.nodes,
            parentNodes: this.props.parentNodes,
            showResultingTree: false
        };
    },

    onCheckboxCheck: function onCheckboxCheck(node, checkboxName, value) {

        //console.log(node, checkboxName, value);
        var role = this.props.role;

        var nodeUuid = node.getMetadata().get('uuid');

        var _role$getAclString = role.getAclString(null, nodeUuid);

        var aclString = _role$getAclString.aclString;
        var inherited = _role$getAclString.inherited;

        // Rebuild new value
        var acls = [];
        if (checkboxName === 'deny' && value) {
            acls = [checkboxName];
        } else if (aclString) {
            acls = aclString.split(',');
            if (acls.indexOf(checkboxName) > -1) {
                acls = acls.filter(function (a) {
                    return a !== checkboxName;
                });
            } else {
                acls.push(checkboxName);
            }
        } else if (value) {
            acls.push(checkboxName);
        }
        this.props.onNodesChange(nodeUuid, acls.join(','));
    },

    roleAclObject: function roleAclObject(node) {
        var role = this.props.role;

        var _role$getAclString2 = role.getAclString(null, node.getMetadata().get("uuid"));

        var aclString = _role$getAclString2.aclString;
        var inherited = _role$getAclString2.inherited;

        var read = aclString.indexOf("read") > -1,
            write = aclString.indexOf("write") > -1,
            deny = aclString.indexOf("deny") > -1;
        return {
            VALUES: { read: read, write: write, deny: deny },
            INHERITED: false,
            DISABLED: {},
            CLASSNAME: inherited ? "parent-inherited" : "",
            EMPTY: !read && !write && !deny
        };
    },

    checkboxesComputeStatus: function checkboxesComputeStatus(node) {

        var data = this.roleAclObject(node);
        var bNode = node,
            parent = undefined;
        var parentData = undefined;
        while (parent = bNode.getParent()) {
            parentData = this.roleAclObject(parent);
            if (!parentData.EMPTY) {
                break;
            }
            bNode = parent;
        }
        if (data.EMPTY && parentData) {
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        } else if (parentData && parentData.VALUES.deny) {
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        }
        if (data.VALUES.deny) {
            data.DISABLED = { read: true, write: true };
        }

        return data;
    },

    render: function render() {
        var mainClassNames = (0, _classNames2['default'])("permission-mask-editor", { "tree-show-accessible-nodes": this.state && this.state.showResultingTree }, { "permission-mask-global-noread": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read });

        //            {"permission-mask-global-nowrite":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write)}
        return _react2['default'].createElement(
            'div',
            { className: mainClassNames },
            _react2['default'].createElement(
                'div',
                { style: { margin: '0 16px', position: 'relative' } },
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute' } },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        iconClassName: 'icon-filter', className: 'smaller-button',
                        tooltip: this.context.getMessage(this.state.showResultingTree ? 'react.13' : 'react.14', 'ajxp_admin'),
                        onClick: (function () {
                            this.setState({ showResultingTree: !this.state.showResultingTree });
                        }).bind(this)
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'read-write-header' },
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-read' },
                        this.context.getMessage('react.5a', 'ajxp_admin')
                    ),
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-write' },
                        this.context.getMessage('react.5b', 'ajxp_admin')
                    ),
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-deny' },
                        this.context.getMessage('react.5', 'ajxp_admin')
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { clear: 'both', marginRight: -34 } },
                    _react2['default'].createElement(PydioComponents.TreeView, {
                        ref: 'tree',
                        dataModel: this.state.dataModel,
                        node: this.state.node,
                        showRoot: true,
                        checkboxes: ["read", "write", "deny"],
                        checkboxesValues: this.state.mask,
                        checkboxesComputeStatus: this.checkboxesComputeStatus,
                        onCheckboxCheck: this.onCheckboxCheck,
                        forceExpand: true
                    })
                )
            )
        );
    }

});

exports['default'] = PermissionMaskEditor;
module.exports = exports['default'];

},{"../model/Role":20,"./MaskNodesProvider":9,"classNames":1,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","pydio/model/data-model":"pydio/model/data-model","pydio/model/node":"pydio/model/node","react":"react"}],12:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var PoliciesLoader = (function (_Observable) {
    _inherits(PoliciesLoader, _Observable);

    function PoliciesLoader() {
        _classCallCheck(this, PoliciesLoader);

        _get(Object.getPrototypeOf(PoliciesLoader.prototype), 'constructor', this).call(this);
        this._loading = false;
        this._loaded = false;
        this._policies = [];
    }

    _createClass(PoliciesLoader, [{
        key: 'load',
        value: function load() {
            var _this = this;

            this._loading = true;
            var api = new _pydioHttpRestApi.PolicyServiceApi(_pydioHttpApi2['default'].getRestClient());
            _pydio2['default'].startLoading();
            api.listPolicies(new _pydioHttpRestApi.IdmListPolicyGroupsRequest()).then(function (data) {
                _pydio2['default'].endLoading();
                _this._policies = [];
                if (data.PolicyGroups) {
                    data.PolicyGroups.map(function (pGroup) {
                        if (pGroup.ResourceGroup === "acl") {
                            _this._policies.push({ id: pGroup.Uuid, label: pGroup.Name });
                        }
                    });
                }
                _this._loaded = true;
                _this._loading = false;
                _this.notify('loaded');
            })['catch'](function () {
                _pydio2['default'].endLoading();
            });
        }
    }, {
        key: 'getPolicies',

        /**
         * @return Promise
         */
        value: function getPolicies() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {

                if (_this2._loaded) {

                    resolve(_this2._policies);
                } else {

                    _this2.observeOnce('loaded', function () {
                        resolve(_this2._policies);
                    });
                    if (!_this2._loading) {
                        _this2.load();
                    }
                }
            });
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!PoliciesLoader.INSTANCE) {
                PoliciesLoader.INSTANCE = new PoliciesLoader();
            }
            return PoliciesLoader.INSTANCE;
        }
    }]);

    return PoliciesLoader;
})(_pydioLangObservable2['default']);

PoliciesLoader.INSTANCE = null;

exports['default'] = PoliciesLoader;
module.exports = exports['default'];

},{"pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable"}],13:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _PoliciesLoader = require('./PoliciesLoader');

var _PoliciesLoader2 = _interopRequireDefault(_PoliciesLoader);

exports['default'] = _react2['default'].createClass({
    displayName: 'RightsSelector',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        acl: _react2['default'].PropTypes.string,
        disabled: _react2['default'].PropTypes.bool,
        hideDeny: _react2['default'].PropTypes.bool,
        hideLabels: _react2['default'].PropTypes.bool,
        advancedAcl: _react2['default'].PropTypes.bool,
        onChange: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            acl: this.props.acl,
            loaded: false,
            policies: []
        };
    },

    componentWillMount: function componentWillMount() {
        var _this = this;

        _PoliciesLoader2['default'].getInstance().getPolicies().then(function (data) {
            _this.setState({ policies: data, loaded: true });
        });
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        this.setState({ acl: newProps.acl });
    },

    getAcl: function getAcl() {
        return this.state.acl;
    },

    updateAcl: function updateAcl() {

        if (this.props.disabled) {
            return;
        }

        var d = this.refs.deny.isChecked();
        var r = !d && this.refs.read.isChecked();
        var w = !d && this.refs.write.isChecked();
        var acl = undefined;
        var parts = [];
        if (d) {
            parts.push('deny');
        } else {
            if (r) {
                parts.push('read');
            }
            if (w) {
                parts.push('write');
            }
        }
        acl = parts.join(",");
        if (this.props.onChange) {
            this.props.onChange(acl, this.props.acl);
        }
        this.setState({ acl: acl });
    },

    handleChangePolicy: function handleChangePolicy(event, value) {
        var acl = 'policy:' + value;
        if (this.props.onChange) {
            this.props.onChange(acl, this.props.acl);
        } else {
            this.setState({ acl: acl });
        }
    },

    render: function render() {
        var advancedAcl = this.props.advancedAcl;

        var acl = this.state.acl || '';
        var policies = this.state.policies;

        var selectedPolicy = 'manual-rights';
        var policyLabel = undefined;
        if (acl.startsWith('policy:')) {
            selectedPolicy = acl.replace('policy:', '');
            var pol = policies.find(function (entry) {
                return entry.id === selectedPolicy;
            });
            if (pol) {
                policyLabel = pol.label;
            } else {
                policyLabel = 'Loading...';
            }
        }

        var checkboxStyle = { width: 44 };

        var deny = undefined;
        if (!this.props.hideDeny) {
            deny = _react2['default'].createElement(_materialUi.Checkbox, { ref: 'deny', label: this.props.hideLabels ? "" : this.context.getMessage('react.5', 'ajxp_admin'), value: '-', disabled: this.props.disabled,
                onCheck: this.updateAcl, checked: acl.indexOf('deny') !== -1, style: checkboxStyle });
        }
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', width: advancedAcl ? 180 : 132, height: 40 } },
            advancedAcl && _react2['default'].createElement(
                _materialUi.IconMenu,
                {
                    iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                    onChange: this.handleChangePolicy.bind(this),
                    value: selectedPolicy,
                    anchorOrigin: { horizontal: 'right', vertical: 'top' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' }
                },
                _react2['default'].createElement(_materialUi.MenuItem, { value: 'manual-rights', primaryText: this.context.getMessage('acls.rights.policy.manual', 'pydio_role') }),
                policies.map(function (entry) {
                    return _react2['default'].createElement(_materialUi.MenuItem, { value: entry.id, primaryText: entry.label });
                })
            ),
            selectedPolicy === 'manual-rights' && _react2['default'].createElement(_materialUi.Checkbox, { ref: 'read',
                label: this.props.hideLabels ? "" : this.context.getMessage('react.5a', 'ajxp_admin'),
                value: 'read',
                onCheck: this.updateAcl,
                disabled: this.props.disabled || acl.indexOf('deny') > -1,
                checked: acl.indexOf('deny') === -1 && acl.indexOf('read') !== -1,
                style: checkboxStyle
            }),
            selectedPolicy === 'manual-rights' && _react2['default'].createElement(_materialUi.Checkbox, {
                ref: 'write',
                label: this.props.hideLabels ? "" : this.context.getMessage('react.5b', 'ajxp_admin'),
                value: 'write',
                onCheck: this.updateAcl,
                disabled: this.props.disabled || acl.indexOf('deny') > -1,
                checked: acl.indexOf('deny') === -1 && acl.indexOf('write') !== -1,
                style: checkboxStyle }),
            selectedPolicy === 'manual-rights' && deny,
            selectedPolicy !== 'manual-rights' && _react2['default'].createElement(
                'div',
                { style: { padding: 12, paddingLeft: 0, fontSize: 14, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                policyLabel
            )
        );
    }

});
module.exports = exports['default'];

},{"../util/MessagesMixin":29,"./PoliciesLoader":12,"material-ui":"material-ui","react":"react"}],14:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilMessagesMixin = require('../util/MessagesMixin');

var _RightsSelector = require('./RightsSelector');

var _RightsSelector2 = _interopRequireDefault(_RightsSelector);

var _PermissionMaskEditor = require('./PermissionMaskEditor');

var _PermissionMaskEditor2 = _interopRequireDefault(_PermissionMaskEditor);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

exports['default'] = React.createClass({
    displayName: 'WorkspaceAcl',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        role: React.PropTypes.instanceOf(_modelRole2['default']),
        workspace: React.PropTypes.instanceOf(_pydioHttpRestApi.IdmWorkspace),

        wsId: React.PropTypes.string,
        label: React.PropTypes.string,
        roleParent: React.PropTypes.object,

        showModal: React.PropTypes.func,
        hideModal: React.PropTypes.func,
        Controller: React.PropTypes.object,
        advancedAcl: React.PropTypes.bool,
        supportsFolderBrowsing: React.PropTypes.bool
    },

    onAclChange: function onAclChange(newValue, oldValue) {
        var _props = this.props;
        var role = _props.role;
        var workspace = _props.workspace;

        role.updateAcl(workspace, null, newValue);
    },

    onNodesChange: function onNodesChange(nodeUuid, checkboxName, value) {
        var _props2 = this.props;
        var role = _props2.role;
        var workspace = _props2.workspace;

        role.updateAcl(null, nodeUuid, checkboxName, workspace);
    },

    getInitialState: function getInitialState() {
        return { displayMask: false };
    },

    toggleDisplayMask: function toggleDisplayMask() {
        this.setState({ displayMask: !this.state.displayMask });
    },

    render: function render() {
        var _props3 = this.props;
        var workspace = _props3.workspace;
        var role = _props3.role;
        var advancedAcl = _props3.advancedAcl;

        console.log(workspace);
        if (!workspace.RootNodes || !Object.keys(workspace.RootNodes).length) {
            // This is not normal, a workspace should always have a root node!
            return React.createElement(PydioComponents.ListEntry, {
                className: "workspace-acl-entry",
                firstLine: React.createElement(
                    'span',
                    { style: { textDecoration: 'line-through', color: '#ef9a9a' } },
                    workspace.Label + ' (' + this.context.getPydioRoleMessage('workspace.roots.invalid') + ')'
                )
            });
        }

        var _role$getAclString = role.getAclString(workspace);

        var aclString = _role$getAclString.aclString;
        var inherited = _role$getAclString.inherited;

        var action = React.createElement(_RightsSelector2['default'], {
            acl: aclString,
            onChange: this.onAclChange,
            hideLabels: true,
            advancedAcl: advancedAcl
        });

        var label = workspace.Label + (inherited ? ' (' + this.context.getPydioRoleMessage('38') + ')' : '');
        var secondLine = undefined;

        if (advancedAcl && (aclString.indexOf('read') !== -1 || aclString.indexOf('write') !== -1)) {

            label = React.createElement(
                'div',
                null,
                label,
                React.createElement(_materialUi.FontIcon, {
                    className: "mdi mdi-" + (this.state.displayMask ? "minus" : "plus"),
                    onClick: this.toggleDisplayMask,
                    style: { cursor: 'pointer', padding: '0 8px', fontSize: 16 }
                })
            );
            if (this.state.displayMask) {
                var aclObject = undefined;
                if (aclString) {
                    aclObject = {
                        read: aclString.indexOf('read') !== -1,
                        write: aclString.indexOf('write') !== -1
                    };
                }

                secondLine = React.createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { margin: '30px 3px 3px' } },
                    React.createElement(_PermissionMaskEditor2['default'], {
                        workspace: workspace,
                        role: role,
                        nodes: {},
                        parentNodes: {},
                        onNodesChange: this.onNodesChange,
                        showModal: this.props.showModal,
                        hideModal: this.props.hideModal,
                        globalWorkspacePermissions: aclObject
                    })
                );
            }
        }

        return React.createElement(PydioComponents.ListEntry, {
            className: (inherited ? "workspace-acl-entry-inherited " : "") + "workspace-acl-entry",
            firstLine: label,
            secondLine: secondLine,
            actions: action
        });
    }

});
module.exports = exports['default'];

},{"../model/Role":20,"../util/MessagesMixin":29,"./PermissionMaskEditor":11,"./RightsSelector":13,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api"}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var WorkspacesAcls = (function (_React$Component) {
    _inherits(WorkspacesAcls, _React$Component);

    function WorkspacesAcls(props) {
        var _this = this;

        _classCallCheck(this, WorkspacesAcls);

        _get(Object.getPrototypeOf(WorkspacesAcls.prototype), 'constructor', this).call(this, props);
        this.state = { workspaces: [] };
        var api = new _pydioHttpRestApi.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
        request.Queries = [_pydioHttpRestApi.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var workspaces = collection.Workspaces || [];
            workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
            _this.setState({ workspaces: workspaces });
        });
    }

    _createClass(WorkspacesAcls, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var role = _props.role;
            var advancedAcl = _props.advancedAcl;
            var workspaces = this.state.workspaces;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                workspaces.map(function (ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], {
                        workspace: ws,
                        role: role,
                        advancedAcl: advancedAcl
                    });
                })
            );
        }
    }]);

    return WorkspacesAcls;
})(_react2['default'].Component);

exports['default'] = WorkspacesAcls;
module.exports = exports['default'];

},{"./WorkspaceAcl":14,"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/lang":"pydio/util/lang","react":"react"}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var GroupInfo = (function (_React$Component) {
    _inherits(GroupInfo, _React$Component);

    function GroupInfo(props) {
        var _this = this;

        _classCallCheck(this, GroupInfo);

        _get(Object.getPrototypeOf(GroupInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"group")]|//param[contains(@scope,"group")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(GroupInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var group = this.props.group;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = group.getIdmUser();
            var role = group.getRole();
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var group = _props.group;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load group-scope parameters
            var values = {},
                locks = '';
            if (group) {
                (function () {
                    // Compute values
                    var idmUser = group.getIdmUser();
                    var role = group.getRole();
                    var label = idmUser.GroupLabel;
                    if (idmUser.Attributes && idmUser.Attributes['displayName']) {
                        label = idmUser.Attributes['displayName'];
                    }
                    values = {
                        groupPath: LangUtils.trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel,
                        displayName: label
                    };
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ "name": "groupPath", label: this.getPydioRoleMessage('34'), "type": "string", readonly: true }, { "name": "displayName", label: this.getPydioRoleMessage('35'), "type": "string" }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2
                })
            );
        }
    }]);

    return GroupInfo;
})(_react2['default'].Component);

GroupInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    group: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = GroupInfo;
module.exports = exports['default'];

},{"../model/User":21,"pydio":"pydio","react":"react"}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelRole = require('../model/Role');

var _modelRole2 = _interopRequireDefault(_modelRole);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var RoleInfo = (function (_React$Component) {
    _inherits(RoleInfo, _React$Component);

    function RoleInfo(props) {
        var _this = this;

        _classCallCheck(this, RoleInfo);

        _get(Object.getPrototypeOf(RoleInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,\'role\')]|//param[contains(@scope,\'role\')]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(RoleInfo, [{
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var role = this.props.role;

            var idmRole = role.getIdmRole();
            if (paramName === "applies") {
                idmRole.AutoApplies = newValue.split(',');
            } else if (paramName === "roleLabel") {
                idmRole.Label = newValue;
            } else if (paramName === "roleForceOverride") {
                idmRole.ForceOverride = newValue;
            } else {
                var param = this.getParameterByName(paramName);
                if (param.aclKey) {
                    role.setParameter(param.aclKey, newValue);
                }
            }
        }
    }, {
        key: 'getParameterByName',
        value: function getParameterByName(paramName) {
            var parameters = this.state.parameters;

            return parameters.filter(function (p) {
                return p.name === paramName;
            })[0];
        }
    }, {
        key: 'render',
        value: function render() {
            var role = this.props.role;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            // Load role parameters
            var params = [{ "name": "roleId", label: this.getPydioRoleMessage('31'), "type": "string", readonly: true }, { "name": "roleLabel", label: this.getPydioRoleMessage('32'), "type": "string" }, { "name": "applies", label: this.getPydioRoleMessage('33'), "type": "select", multiple: true, choices: 'admin|Administrators,standard|Standard,shared|Shared Users,anon|Anonymous' }, { "name": "roleForceOverride", label: "Always Override", "type": "boolean" }].concat(_toConsumableArray(parameters));

            var values = { applies: [] };
            if (role) {
                var idmRole = role.getIdmRole();
                var applies = idmRole.AutoApplies || [];
                values = {
                    roleId: idmRole.Uuid,
                    applies: applies.filter(function (v) {
                        return !!v;
                    }), // filter empty values
                    roleLabel: idmRole.Label,
                    roleForceOverride: idmRole.ForceOverride || false
                };
                parameters.map(function (p) {
                    if (p.aclKey && role.getParameterValue(p.aclKey)) {
                        values[p.name] = role.getParameterValue(p.aclKey);
                    }
                });
            }
            //console.log(values);

            return _react2['default'].createElement(FormPanel, {
                parameters: params,
                onParameterChange: this.onParameterChange.bind(this),
                values: values,
                depth: -2
            });
        }
    }]);

    return RoleInfo;
})(_react2['default'].Component);

RoleInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    role: _react2['default'].PropTypes.instanceOf(_modelRole2['default'])
};

exports['default'] = RoleInfo;
module.exports = exports['default'];

},{"../model/Role":20,"pydio":"pydio","react":"react"}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2["default"].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var _Pydio$requireLib2 = _pydio2["default"].requireLib('boot');

var moment = _Pydio$requireLib2.moment;

var UserActivity = (function (_React$Component) {
    _inherits(UserActivity, _React$Component);

    function UserActivity(props) {
        _classCallCheck(this, UserActivity);

        _get(Object.getPrototypeOf(UserActivity.prototype), "constructor", this).call(this, props);
        this.state = { activity: [], loading: false };
    }

    _createClass(UserActivity, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadActivity();
        }
    }, {
        key: "loadActivity",
        value: function loadActivity() {
            var _this = this;

            var user = this.props.user;

            return _pydioHttpResourcesManager2["default"].loadClass('EnterpriseSDK').then(function (sdk) {

                var request = new _pydioHttpRestApi.LogListLogRequest();
                request.Query = "+UserUuid:\"" + user.getIdmUser().Uuid + "\"";
                request.Page = 0;
                request.Size = 50;
                request.Format = _pydioHttpRestApi.ListLogRequestLogFormat.constructFromObject('JSON');
                var api = new sdk.EnterpriseLogServiceApi(_pydioHttpApi2["default"].getRestClient());
                _this.setState({ loading: true });
                api.audit(request).then(function (response) {
                    _this.setState({ activity: response.Logs || [], loading: false });
                })["catch"](function () {
                    _this.setState({ activity: [], loading: false });
                });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var pydio = this.props.pydio;
            var _state = this.state;
            var activity = _state.activity;
            var loading = _state.loading;

            var columns = [{ name: 'Ts', label: pydio.MessageHash['settings.17'], style: { width: '25%' }, headerStyle: { width: '25%' }, renderCell: function renderCell(row) {
                    return moment(row.Ts * 1000).fromNow();
                } }, { name: 'Msg', label: pydio.MessageHash['ajxp_admin.logs.message'] }];
            return _react2["default"].createElement(
                "div",
                { className: "vertical-layout", style: { height: '100%' } },
                _react2["default"].createElement(
                    "h3",
                    { className: "paper-right-title" },
                    pydio.MessageHash['ajxp_admin.ws.33'],
                    _react2["default"].createElement(
                        "div",
                        { className: "section-legend" },
                        "See Dashboard > Activity and use the filter to get more activity for this user"
                    )
                ),
                _react2["default"].createElement(
                    _materialUi.Paper,
                    { style: { margin: 16 }, zDepth: 1, className: "workspace-activity-block layout-fill vertical-layout" },
                    _react2["default"].createElement(MaterialTable, {
                        columns: columns,
                        data: activity,
                        showCheckboxes: false,
                        emptyStateString: 'No activity found'
                    })
                )
            );
        }
    }]);

    return UserActivity;
})(_react2["default"].Component);

exports["default"] = UserActivity;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio":"pydio","pydio/http/api":"pydio/http/api","pydio/http/resources-manager":"pydio/http/resources-manager","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var _materialUi = require('material-ui');

var _userUserRolesPicker = require('../user/UserRolesPicker');

var _userUserRolesPicker2 = _interopRequireDefault(_userUserRolesPicker);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var FormPanel = _Pydio$requireLib.FormPanel;

var UserInfo = (function (_React$Component) {
    _inherits(UserInfo, _React$Component);

    function UserInfo(props) {
        var _this = this;

        _classCallCheck(this, UserInfo);

        _get(Object.getPrototypeOf(UserInfo.prototype), 'constructor', this).call(this, props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"user")]|//param[contains(@scope,"user")]').then(function (params) {
            _this.setState({ parameters: params });
        });
    }

    _createClass(UserInfo, [{
        key: 'getBinaryContext',
        value: function getBinaryContext() {
            var user = this.props.user;

            return "user_id=" + user.getIdmUser().Login + (user.getIdmUser().Attributes && user.getIdmUser().Attributes['avatar'] ? '?' + user.getIdmUser().Attributes['avatar'] : '');
        }
    }, {
        key: 'getPydioRoleMessage',
        value: function getPydioRoleMessage(messageId) {
            var pydio = this.props.pydio;

            return pydio.MessageHash['role_editor.' + messageId] || messageId;
        }
    }, {
        key: 'onParameterChange',
        value: function onParameterChange(paramName, newValue, oldValue) {
            var user = this.props.user;
            var parameters = this.state.parameters;

            var params = parameters.filter(function (p) {
                return p.name === paramName;
            });
            var idmUser = user.getIdmUser();
            var role = user.getRole();
            // do something
            if (paramName === 'displayName' || paramName === 'email' || paramName === 'profile' || paramName === 'avatar') {
                idmUser.Attributes[paramName] = newValue;
            } else if (params.length && params[0].aclKey) {
                role.setParameter(params[0].aclKey, newValue);
            }
        }
    }, {
        key: 'buttonCallback',
        value: function buttonCallback(action) {
            var user = this.props.user;

            if (action === "update_user_pwd") {
                this.props.pydio.UI.openComponentInModal('AdminPeople', 'UserPasswordDialog', { user: user });
            } else {
                (function () {
                    var idmUser = user.getIdmUser();
                    var lockName = action === 'user_set_lock-lock' ? 'logout' : 'pass_change';
                    var currentLocks = [];
                    if (idmUser.Attributes['locks']) {
                        var test = JSON.parse(idmUser.Attributes['locks']);
                        if (test && typeof test === "object") {
                            currentLocks = test;
                        }
                    }
                    if (currentLocks.indexOf(lockName) > -1) {
                        currentLocks = currentLocks.filter(function (l) {
                            return l !== lockName;
                        });
                        if (action === 'user_set_lock-lock') {
                            // Reset also the failedConnections attempts
                            delete idmUser.Attributes["failedConnections"];
                        }
                    } else {
                        currentLocks.push(lockName);
                    }
                    idmUser.Attributes['locks'] = JSON.stringify(currentLocks);
                    user.save();
                })();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var user = _props.user;
            var pydio = _props.pydio;
            var parameters = this.state.parameters;

            if (!parameters) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    'Loading...'
                );
            }

            var values = { profiles: [] };
            var locks = [];
            var rolesPicker = undefined;

            if (user) {
                (function () {
                    // Compute values
                    var idmUser = user.getIdmUser();
                    var role = user.getRole();
                    if (idmUser.Attributes['locks']) {
                        locks = JSON.parse(idmUser.Attributes['locks']) || [];
                        if (typeof locks === 'object' && locks.length === undefined) {
                            (function () {
                                // Backward compat issue
                                var arrL = [];
                                Object.keys(locks).forEach(function (k) {
                                    if (locks[k] === true) {
                                        arrL.push(k);
                                    }
                                });
                                locks = arrL;
                            })();
                        }
                    }
                    rolesPicker = _react2['default'].createElement(_userUserRolesPicker2['default'], {
                        roles: idmUser.Roles,
                        addRole: function (r) {
                            return user.addRole(r);
                        },
                        removeRole: function (r) {
                            return user.removeRole(r);
                        },
                        switchRoles: function (r1, r2) {
                            return user.switchRoles(r1, r2);
                        }
                    });

                    var attributes = idmUser.Attributes || {};
                    values = _extends({}, values, {
                        avatar: attributes['avatar'],
                        displayName: attributes['displayName'],
                        email: attributes['email'],
                        profile: attributes['profile'],
                        login: idmUser.Login
                    });
                    parameters.map(function (p) {
                        if (p.aclKey && role.getParameterValue(p.aclKey)) {
                            values[p.name] = role.getParameterValue(p.aclKey);
                        }
                    });
                })();
            }
            var params = [{ name: "login", label: this.getPydioRoleMessage('21'), description: pydio.MessageHash['pydio_role.31'], "type": "string", readonly: true }, { name: "profile", label: this.getPydioRoleMessage('22'), description: pydio.MessageHash['pydio_role.32'], "type": "select", choices: 'admin|Administrator,standard|Standard,shared|Shared' }].concat(_toConsumableArray(parameters));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: "paper-right-title", style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        pydio.MessageHash['pydio_role.24'],
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            pydio.MessageHash['pydio_role.54']
                        )
                    ),
                    _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-dots-vertical" }),
                            anchorOrigin: { horizontal: 'right', vertical: 'top' },
                            targetOrigin: { horizontal: 'right', vertical: 'top' },
                            tooltip: "Actions"
                        },
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage('25'), onTouchTap: function () {
                                return _this2.buttonCallback('update_user_pwd');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('logout') > -1 ? '27' : '26'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-lock');
                            } }),
                        _react2['default'].createElement(_materialUi.MenuItem, { primaryText: this.getPydioRoleMessage(locks.indexOf('pass_change') > -1 ? '28b' : '28'), onTouchTap: function () {
                                return _this2.buttonCallback('user_set_lock-pass_change');
                            } })
                    )
                ),
                _react2['default'].createElement(FormPanel, {
                    parameters: params,
                    onParameterChange: this.onParameterChange.bind(this),
                    values: values,
                    depth: -2,
                    binary_context: this.getBinaryContext()
                }),
                rolesPicker
            );
        }
    }]);

    return UserInfo;
})(_react2['default'].Component);

UserInfo.PropTypes = {
    pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']).isRequired,
    pluginsRegistry: _react2['default'].PropTypes.instanceOf(XMLDocument),
    user: _react2['default'].PropTypes.instanceOf(_modelUser2['default'])
};

exports['default'] = UserInfo;
module.exports = exports['default'];

},{"../model/User":21,"../user/UserRolesPicker":28,"material-ui":"material-ui","pydio":"pydio","react":"react"}],20:[function(require,module,exports){
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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

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
            this.idmRole.Uuid = (0, _uuid42['default'])();
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
                    var copy = _pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(a)));
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
                return { aclString: "", 'false': false };
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
                        var acl = new _pydioHttpRestApi.IdmACL();
                        acl.NodeID = n;
                        if (workspace) {
                            acl.WorkspaceID = workspace.UUID;
                        } else if (isRoot) {
                            acl.WorkspaceID = nodeWs.UUID;
                        }
                        acl.RoleID = _this9.idmRole.Uuid;
                        acl.Action = _pydioHttpRestApi.IdmACLAction.constructFromObject({ Name: r, Value: "1" });
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
                    var copy = _pydioHttpRestApi.IdmACL.constructFromObject(JSON.parse(JSON.stringify(acl)));
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

},{"pydio/http/api":"pydio/http/api","pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid4":2}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydioLangObservable = require('pydio/lang/observable');

var _pydioLangObservable2 = _interopRequireDefault(_pydioLangObservable);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid4 = require('uuid4');

var _Role = require('./Role');

var _Role2 = _interopRequireDefault(_Role);

var User = (function (_Observable) {
    _inherits(User, _Observable);

    /**
     *
     * @param idmUser {IdmUser}
     */

    function User(idmUser) {
        var _this = this;

        _classCallCheck(this, User);

        _get(Object.getPrototypeOf(User.prototype), 'constructor', this).call(this);
        this.acls = [];
        var parentRoles = [];
        if (idmUser) {
            this.idmUser = idmUser;
            if (this.idmUser.Roles) {
                this.idmRole = this.idmUser.Roles.filter(function (r) {
                    return r.Uuid === _this.idmUser.Uuid;
                })[0];
                if (!this.idmUser.IsGroup) {
                    parentRoles = this.idmUser.Roles.filter(function (r) {
                        return r.Uuid !== _this.idmUser.Uuid;
                    });
                }
            }
            if (!this.idmUser.Attributes) {
                this.idmUser.Attributes = {};
            }
        } else {
            this.idmUser = new _pydioHttpRestApi.IdmUser();
            this.idmUser.Uuid = (0, _uuid4.sync)();
            this.idmRole = _pydioHttpRestApi.IdmRole.constructFromObject({ Uuid: this.idmUser.Uuid });
            this.idmUser.Roles = [this.idmRole];
            this.idmUser.Attributes = {};
        }
        this.role = new _Role2['default'](this.idmRole, parentRoles);
        this.role.observe('update', function () {
            _this.dirty |= _this.role.isDirty();
            _this.notify('update');
        });
        this.makeSnapshot();
    }

    _createClass(User, [{
        key: 'load',
        value: function load() {
            var _this2 = this;

            this.role.load().then(function () {
                _this2.notify('update');
            });
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this.dirty;
        }
    }, {
        key: 'save',
        value: function save() {
            var _this3 = this;

            return PydioApi.getRestClient().getIdmApi().updateIdmUser(this.idmUser).then(function (newUser) {
                _this3.idmUser = newUser;
                if (_this3.role.isDirty()) {
                    return _this3.role.save().then(function () {
                        _this3.makeSnapshot();
                        _this3.dirty = false;
                        _this3.notify('update');
                    });
                } else {
                    _this3.makeSnapshot();
                    _this3.dirty = false;
                    _this3.notify('update');
                    return Promise.resolve(_this3);
                }
            });
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.idmUser = this.snapshot;
            this.makeSnapshot();
            this.dirty = false;
            this.notify('update');
            this.role.revert();
        }
    }, {
        key: 'makeSnapshot',
        value: function makeSnapshot() {
            this.snapshot = _pydioHttpRestApi.IdmUser.constructFromObject(JSON.parse(JSON.stringify(this.idmUser)));
        }

        /**
         * @return {Role}
         */
    }, {
        key: 'getRole',
        value: function getRole() {
            return this.role;
        }
    }, {
        key: 'addRole',
        value: function addRole(role) {
            var _this4 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this4.idmUser.Uuid;
            });
            parentRoles = [].concat(_toConsumableArray(parentRoles.filter(function (r) {
                return r.Uuid !== role.Uuid;
            })), [role]);
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'removeRole',
        value: function removeRole(role) {
            var _this5 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this5.idmUser.Uuid && r.Uuid !== role.Uuid;
            });
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }
    }, {
        key: 'switchRoles',
        value: function switchRoles(roleId1, roleId2) {
            var _this6 = this;

            var parentRoles = this.idmUser.Roles.filter(function (r) {
                return r.Uuid !== _this6.idmUser.Uuid;
            });
            var pos1 = undefined,
                pos2 = undefined,
                b = undefined;
            for (var i = 0; i < parentRoles.length; i++) {
                if (parentRoles[i].Uuid === roleId1) {
                    pos1 = i;
                    b = parentRoles[i];
                } else if (parentRoles[i].Uuid === roleId2) {
                    pos2 = i;
                }
            }
            parentRoles[pos1] = parentRoles[pos2];
            parentRoles[pos2] = b;
            this.idmUser.Roles = [].concat(_toConsumableArray(parentRoles), [this.idmRole]);
            this.dirty = true;
            this.role.updateParentRoles(parentRoles);
        }

        /**
         *
         * @return {IdmUser}
         */
    }, {
        key: 'getIdmUser',
        value: function getIdmUser() {
            return this.buildProxy(this.idmUser);
        }

        /**
         * @param object {IdmUser}
         * @return {IdmUser}
         */
    }, {
        key: 'buildProxy',
        value: function buildProxy(object) {
            var _this7 = this;

            return new Proxy(object, {
                set: function set(target, p, value) {
                    target[p] = value;
                    _this7.dirty = true;
                    _this7.notify('update');
                    return true;
                },
                get: function get(target, p) {
                    var out = target[p];
                    if (out instanceof Array) {
                        return out;
                    } else if (out instanceof Object) {
                        return _this7.buildProxy(out);
                    } else {
                        return out;
                    }
                }
            });
        }
    }]);

    return User;
})(_pydioLangObservable2['default']);

exports['default'] = User;
module.exports = exports['default'];

},{"./Role":20,"pydio/http/rest-api":"pydio/http/rest-api","pydio/lang/observable":"pydio/lang/observable","uuid4":2}],22:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var AsyncComponent = _Pydio$requireLib.AsyncComponent;
exports['default'] = _react2['default'].createClass({
    displayName: 'SharesList',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        pydio: _react2['default'].PropTypes.instanceOf(_pydio2['default']),
        userId: _react2['default'].PropTypes.string.isRequired,
        userData: _react2['default'].PropTypes.object.isRequired
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var userId = _props.userId;

        return _react2['default'].createElement(
            'div',
            { className: 'vertical-layout', style: { height: '100%' } },
            _react2['default'].createElement(
                'h3',
                { className: 'paper-right-title' },
                this.context.getMessage('49'),
                _react2['default'].createElement(
                    'div',
                    { className: 'section-legend' },
                    this.context.getMessage('52')
                )
            ),
            _react2['default'].createElement(
                _materialUi.Paper,
                { style: { margin: 16 }, zDepth: 1, className: 'workspace-activity-block layout-fill vertical-layout' },
                _react2['default'].createElement(AsyncComponent, {
                    pydio: pydio,
                    subject: "user:" + userId,
                    defaultShareType: 'CELLS',
                    namespace: "ShareDialog",
                    componentName: "ShareView"
                })
            )
        );
    }
});
module.exports = exports['default'];

},{"../util/MessagesMixin":29,"material-ui":"material-ui","pydio":"pydio","react":"react"}],23:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _ParametersPicker = require('./ParametersPicker');

var _ParametersPicker2 = _interopRequireDefault(_ParametersPicker);

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2["default"].requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;

var ThemedTitle = (function (_React$Component) {
    _inherits(ThemedTitle, _React$Component);

    function ThemedTitle() {
        _classCallCheck(this, ThemedTitle);

        _get(Object.getPrototypeOf(ThemedTitle.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(ThemedTitle, [{
        key: "render",
        value: function render() {
            var _props = this.props;
            var getMessage = _props.getMessage;
            var muiTheme = _props.muiTheme;

            var bgColor = muiTheme.palette.primary1Color;
            return _react2["default"].createElement(
                "div",
                { style: { backgroundColor: bgColor, color: 'white', padding: '0 24px 24px' } },
                _react2["default"].createElement(
                    "h3",
                    { style: { color: 'white' } },
                    getMessage('14')
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "legend" },
                    getMessage('15')
                )
            );
        }
    }]);

    return ThemedTitle;
})(_react2["default"].Component);

ThemedTitle = (0, _materialUiStyles.muiThemeable)()(ThemedTitle);

var ParameterCreate = _react2["default"].createClass({
    displayName: "ParameterCreate",

    mixins: [ActionDialogMixin, CancelButtonProviderMixin],

    propTypes: {
        workspaceScope: _react2["default"].PropTypes.string,
        showModal: _react2["default"].PropTypes.func,
        hideModal: _react2["default"].PropTypes.func,
        pluginsFilter: _react2["default"].PropTypes.func,
        roleType: _react2["default"].PropTypes.oneOf(['user', 'group', 'role']),
        createParameter: _react2["default"].PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogPadding: 0,
            dialogTitle: '',
            dialogSize: 'md'
        };
    },

    getInitialState: function getInitialState() {
        return {
            step: 1,
            workspaceScope: this.props.workspaceScope,
            pluginName: null,
            paramName: null,
            actions: {},
            parameters: {}
        };
    },

    setSelection: function setSelection(plugin, type, param, attributes) {
        this.setState({ pluginName: plugin, type: type, paramName: param, attributes: attributes }, this.createParameter);
    },

    createParameter: function createParameter() {
        this.props.createParameter(this.state.type, this.state.pluginName, this.state.paramName, this.state.attributes);
        this.props.onDismiss();
    },

    render: function render() {

        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'pydio_role' : arguments[1];
            return pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var actions = _props2.actions;
        var parameters = _props2.parameters;

        return _react2["default"].createElement(
            "div",
            { className: "picker-list" },
            _react2["default"].createElement(ThemedTitle, { getMessage: getMessage }),
            _react2["default"].createElement(_ParametersPicker2["default"], {
                pydio: pydio,
                allActions: actions,
                allParameters: parameters,
                onSelection: this.setSelection,
                getMessage: getMessage
            })
        );
    }

});

exports["default"] = ParameterCreate;
module.exports = exports["default"];

},{"./ParametersPicker":26,"material-ui/styles":"material-ui/styles","pydio":"pydio","react":"react"}],24:[function(require,module,exports){
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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _modelRole = require('../model/Role');

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioForm = _pydio2['default'].requireLib("form");

exports['default'] = _react2['default'].createClass({
    displayName: 'ParameterEntry',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        acl: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.IdmACL),
        role: _react2['default'].PropTypes.instanceOf(_modelRole.Role),

        actions: _react2['default'].PropTypes.object,
        parameters: _react2['default'].PropTypes.object,

        inherited: _react2['default'].PropTypes.bool
    },

    getInitialState: function getInitialState() {
        return { editMode: false };
    },

    onChangeParameter: function onChangeParameter(newValue, oldValue) {
        var additionalFormData = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        if (newValue === oldValue) return;
        var _props = this.props;
        var role = _props.role;
        var acl = _props.acl;

        var aclKey = acl.Action.Name;
        role.setParameter(aclKey, newValue, acl.WorkspaceID);
    },

    deleteParameter: function deleteParameter() {
        var _props2 = this.props;
        var role = _props2.role;
        var acl = _props2.acl;

        role.deleteParameter(acl);
    },

    overrideParameter: function overrideParameter() {
        var _props3 = this.props;
        var role = _props3.role;
        var acl = _props3.acl;

        var aclKey = acl.Action.Name;

        var _aclKey$split = aclKey.split(":");

        var _aclKey$split2 = _slicedToArray(_aclKey$split, 3);

        var type = _aclKey$split2[0];
        var pluginId = _aclKey$split2[1];
        var name = _aclKey$split2[2];

        var value = "";
        if (type === "action") {
            value = false;
        }
        role.setParameter(aclKey, value, acl.WorkspaceID);
    },

    onInputEditMode: function onInputEditMode(editMode) {
        this.setState({ editMode: editMode });
    },

    toggleEditMode: function toggleEditMode() {
        if (this.refs.formElement) {
            this.refs.formElement.toggleEditMode();
        }
    },

    toggleActionStatus: function toggleActionStatus(event, status) {
        var _props4 = this.props;
        var role = _props4.role;
        var acl = _props4.acl;

        role.setParameter(acl.Action.Name, status, acl.WorkspaceID);
    },

    render: function render() {
        var _props5 = this.props;
        var acl = _props5.acl;
        var actions = _props5.actions;
        var parameters = _props5.parameters;
        var pydio = _props5.pydio;

        var _acl$Action$Name$split = acl.Action.Name.split(":");

        var _acl$Action$Name$split2 = _slicedToArray(_acl$Action$Name$split, 3);

        var type = _acl$Action$Name$split2[0];
        var pluginId = _acl$Action$Name$split2[1];
        var name = _acl$Action$Name$split2[2];

        var value = undefined;
        if (name === 'DEFAULT_START_REPOSITORY') {
            value = acl.Action.Value;
        } else {
            value = JSON.parse(acl.Action.Value);
        }
        var inherited = acl.INHERITED;
        var label = name;
        var paramData = undefined;
        if (type === 'parameter' && parameters[pluginId]) {
            var filters = parameters[pluginId].filter(function (p) {
                return p.parameter === name;
            });
            if (filters.length) {
                paramData = filters[0];
            }
        } else if (type === 'action' && actions[pluginId]) {
            var filters = actions[pluginId].filter(function (p) {
                return p.action === name;
            });
            if (filters.length) {
                paramData = filters[0];
            }
        }
        var element = undefined;
        if (type === 'parameter') {
            var attributes = { type: 'string', label: label, name: name };
            if (paramData) {
                attributes = PydioForm.Manager.parameterNodeToHash(paramData.xmlNode);
            }
            if (attributes['scope'] === 'user') {
                return null;
            }
            label = attributes.label;
            element = PydioForm.createFormElement({
                ref: "formElement",
                attributes: attributes,
                name: name,
                value: value,
                onChange: this.onChangeParameter,
                disabled: inherited,
                onChangeEditMode: this.onInputEditMode,
                displayContext: 'grid'
            });
        } else {
            if (paramData) {
                label = _pydioUtilXml2['default'].XPathGetSingleNodeText(paramData.xmlNode, "gui/@text") || label;
                if (pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
            }
            element = _react2['default'].createElement(
                'div',
                { className: 'role-action-toggle' },
                _react2['default'].createElement(_materialUi.Toggle, {
                    name: this.props.name,
                    onToggle: this.toggleActionStatus.bind(this),
                    toggled: !!value,
                    label: this.context.getMessage(value ? '2' : '3'),
                    labelPosition: "right"
                })
            );
        }

        var actionButtons = undefined;
        var buttonStyle = { style: { opacity: 0.2 }, hoveredStyle: { opacity: 1 } };
        if (type === 'parameter') {
            if (this.state.editMode) {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-content-save',
                    tooltip: this.context.getMessage('6'),
                    onClick: this.toggleEditMode
                }, buttonStyle));
            } else {
                actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                    iconClassName: 'mdi mdi-close',
                    tooltip: this.context.getMessage('4'),
                    onClick: this.deleteParameter
                }, buttonStyle));
                if (inherited) {
                    actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                        iconClassName: 'mdi mdi-content-copy',
                        tooltip: this.context.getMessage('5'),
                        onClick: this.overrideParameter
                    }, buttonStyle));
                }
            }
        } else if (!inherited) {
            actionButtons = _react2['default'].createElement(_materialUi.IconButton, _extends({
                iconClassName: 'mdi mdi-close',
                tooltip: this.context.getMessage('4'),
                onClick: this.deleteParameter
            }, buttonStyle));
        } else {
            actionButtons = _react2['default'].createElement('div', { style: { width: 48, height: 48 } });
        }
        return _react2['default'].createElement(
            'tr',
            { className: (inherited ? 'inherited' : '') + (this.state.editMode ? ' edit-mode' : ''), style: _extends({}, this.props.style) },
            _react2['default'].createElement(
                'td',
                { style: { width: '40%', fontWeight: 500 } },
                inherited ? '[' + this.context.getPydioRoleMessage('38') + ']' : '',
                ' ',
                label
            ),
            _react2['default'].createElement(
                'td',
                { style: { wordBreak: 'break-all' } },
                element
            ),
            _react2['default'].createElement(
                'td',
                { style: { width: 50 } },
                actionButtons
            )
        );
    }
});
module.exports = exports['default'];

},{"../model/Role":20,"../util/MessagesMixin":29,"material-ui":"material-ui","pydio":"pydio","pydio/http/rest-api":"pydio/http/rest-api","pydio/util/xml":"pydio/util/xml","react":"react"}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ParameterEntry = require('./ParameterEntry');

var _ParameterEntry2 = _interopRequireDefault(_ParameterEntry);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var ParametersPanel = (function (_React$Component) {
    _inherits(ParametersPanel, _React$Component);

    function ParametersPanel(props) {
        var _this = this;

        _classCallCheck(this, ParametersPanel);

        _get(Object.getPrototypeOf(ParametersPanel.prototype), 'constructor', this).call(this, props);
        this.state = { actions: {}, parameters: {}, workspaces: {} };
        var api = new _pydioHttpRestApi.WorkspaceServiceApi(PydioApi.getRestClient());
        var request = new _pydioHttpRestApi.RestSearchWorkspaceRequest();
        request.Queries = [_pydioHttpRestApi.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var wss = collection.Workspaces || [];
            var workspaces = {};
            wss.forEach(function (ws) {
                workspaces[ws.UUID] = ws;
            });
            _this.setState({ workspaces: workspaces });
        });
    }

    _createClass(ParametersPanel, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var loader = AdminComponents.PluginsLoader.getInstance(this.props.pydio);
            loader.allPluginsActionsAndParameters().then(function (plugins) {
                _this2.setState({ actions: plugins.ACTIONS, parameters: plugins.PARAMETERS });
            });
        }
    }, {
        key: 'onCreateParameter',
        value: function onCreateParameter(scope, type, pluginName, paramName, attributes) {
            var role = this.props.role;

            var aclKey = type + ':' + pluginName + ':' + paramName;
            var value = undefined;
            //console.log(scope, type, pluginName, paramName, attributes);
            if (type === 'action') {
                value = false;
            } else if (attributes && attributes.xmlNode) {
                var xmlNode = attributes.xmlNode;
                value = xmlNode.getAttribute('default') ? xmlNode.getAttribute('default') : "";
                if (xmlNode.getAttribute('type') === 'boolean') {
                    value = value === "true";
                } else if (xmlNode.getAttribute('type') === 'integer') {
                    value = parseInt(value);
                }
            }
            role.setParameter(aclKey, value, scope);
        }
    }, {
        key: 'addParameter',
        value: function addParameter(scope) {
            var _this3 = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var roleType = _props.roleType;
            var _state = this.state;
            var actions = _state.actions;
            var parameters = _state.parameters;

            pydio.UI.openComponentInModal('AdminPeople', 'ParameterCreate', {
                pydio: pydio,
                actions: actions,
                parameters: parameters,
                workspaceScope: scope,
                createParameter: function createParameter(type, pluginName, paramName, attributes) {
                    _this3.onCreateParameter(scope, type, pluginName, paramName, attributes);
                },
                roleType: roleType
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props;
            var role = _props2.role;
            var pydio = _props2.pydio;

            if (!role) {
                return null;
            }
            var workspaces = this.state.workspaces;

            var m = function m(id) {
                return pydio.MessageHash['pydio_role.' + id] || id;
            };

            var params = role.listParametersAndActions();
            var scopes = {
                PYDIO_REPO_SCOPE_ALL: {},
                PYDIO_REPO_SCOPE_SHARED: {}
            };

            params.forEach(function (a) {
                if (!scopes[a.WorkspaceID]) {
                    scopes[a.WorkspaceID] = {};
                }

                var _a$Action$Name$split = a.Action.Name.split(':');

                var _a$Action$Name$split2 = _slicedToArray(_a$Action$Name$split, 3);

                var type = _a$Action$Name$split2[0];
                var pluginId = _a$Action$Name$split2[1];
                var paramName = _a$Action$Name$split2[2];

                scopes[a.WorkspaceID][paramName] = a;
            });
            var wsItems = [_react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.selector.title'), value: 1 }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.all'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_ALL');
                } }), _react2['default'].createElement(_materialUi.MenuItem, { primaryText: m('parameters.scope.shared'), onTouchTap: function () {
                    _this4.addParameter('PYDIO_REPO_SCOPE_SHARED');
                } }), _react2['default'].createElement(_materialUi.Divider, null)].concat(Object.keys(workspaces).map(function (ws) {
                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: workspaces[ws].Label, onTouchTap: function () {
                        _this4.addParameter(ws);
                    } });
            }));

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'h3',
                    { className: 'paper-right-title', style: { display: 'flex' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { flex: 1, paddingRight: 20 } },
                        m('46'),
                        _react2['default'].createElement(
                            'div',
                            { className: "section-legend" },
                            m('47')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 160 } },
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            { fullWidth: true, value: 1 },
                            wsItems
                        )
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '0 20px' } },
                    Object.keys(scopes).map(function (s) {
                        var scopeLabel = undefined;
                        var odd = false;
                        if (s === 'PYDIO_REPO_SCOPE_ALL') {
                            scopeLabel = m('parameters.scope.all');
                        } else if (s === 'PYDIO_REPO_SCOPE_SHARED') {
                            scopeLabel = m('parameters.scope.shared');
                        } else if (workspaces[s]) {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', workspaces[s].Label);
                        } else {
                            scopeLabel = m('parameters.scope.workspace').replace('%s', s);
                        }
                        var entries = undefined;
                        if (Object.keys(scopes[s]).length) {
                            entries = Object.keys(scopes[s]).map(function (param) {
                                var style = { backgroundColor: odd ? '#FAFAFA' : 'white' };
                                odd = !odd;
                                return _react2['default'].createElement(_ParameterEntry2['default'], _extends({ pydio: pydio, acl: scopes[s][param], role: role }, _this4.state, { style: style }));
                            });
                        } else {
                            entries = _react2['default'].createElement(
                                'tr',
                                null,
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 3, style: { padding: '14px 0' } },
                                    m('parameters.empty')
                                )
                            );
                        }
                        return _react2['default'].createElement(
                            'table',
                            { style: { width: '100%', marginBottom: 20 } },
                            _react2['default'].createElement(
                                'tr',
                                { style: { borderBottom: '1px solid #e0e0e0' } },
                                _react2['default'].createElement(
                                    'td',
                                    { colSpan: 2, style: { fontSize: 15, paddingTop: 10 } },
                                    scopeLabel
                                ),
                                _react2['default'].createElement(
                                    'td',
                                    { style: { width: 50 } },
                                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", onTouchTap: function () {
                                            _this4.addParameter(s);
                                        }, tooltip: m('parameters.custom.add') })
                                )
                            ),
                            entries
                        );
                    })
                )
            );
        }
    }]);

    return ParametersPanel;
})(_react2['default'].Component);

exports['default'] = ParametersPanel;
module.exports = exports['default'];

},{"./ParameterEntry":24,"material-ui":"material-ui","pydio/http/rest-api":"pydio/http/rest-api","react":"react"}],26:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _pydioUtilLang = require("pydio/util/lang");

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _materialUi = require('material-ui');

var ParametersPicker = _react2["default"].createClass({
    displayName: "ParametersPicker",

    propTypes: {
        allParameters: _react2["default"].PropTypes.object.isRequired,
        allActions: _react2["default"].PropTypes.object.isRequired,
        onSelection: _react2["default"].PropTypes.func.isRequired,
        getMessage: _react2["default"].PropTypes.func,
        actionsPrefix: _react2["default"].PropTypes.string,
        parametersPrefix: _react2["default"].PropTypes.string,
        initialSelection: _react2["default"].PropTypes.object
    },

    getDefaultProps: function getDefaultProps() {
        return { actionsPrefix: '[a] ', parametersPrefix: '' };
    },

    getInitialState: function getInitialState() {
        var s = { filter: null };
        if (this.props.initialSelection) {
            s = _pydioUtilLang2["default"].mergeObjectsRecursive({ filter: this.props.initialSelection.paramName }, this.props.initialSelection);
        }
        return s;
    },

    filter: function filter(event) {
        this.setState({ filter: event.target.value.toLowerCase() });
    },

    select: function select(plugin, type, param, attributes) {
        this.props.onSelection(plugin, type, param, attributes);
        this.setState({ pluginName: plugin, type: type, paramName: param });
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        setTimeout(function () {
            _this.refs.input.focus();
        }, 150);
    },

    render: function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var allParameters = _props.allParameters;
        var allActions = _props.allActions;

        var term = this.state.filter;
        var selection = this.state.paramName;
        var selectedPlugin = this.state.pluginName;
        var selectionType = this.state.type;

        var filter = function filter(name) {
            if (!term) {
                return true;
            }
            return name.toLowerCase().indexOf(term) !== -1;
        };

        var highlight = function highlight(name) {
            if (!term) {
                return name;
            }
            var pos = name.toLowerCase().indexOf(term);
            var start = name.substr(0, pos);
            var middle = name.substr(pos, term.length);
            var end = name.substr(pos + term.length);
            return _react2["default"].createElement(
                "span",
                null,
                start,
                _react2["default"].createElement(
                    "span",
                    { className: "highlight" },
                    middle
                ),
                end
            );
        };

        var entries = [];
        var merge = {};
        Object.keys(allParameters).forEach(function (pName) {
            var _merge$pName$params;

            if (!merge[pName]) {
                merge[pName] = { name: pName, label: pName, actions: [], params: [] };
            }
            (_merge$pName$params = merge[pName].params).push.apply(_merge$pName$params, _toConsumableArray(allParameters[pName]));
        });
        Object.keys(allActions).forEach(function (pName) {
            var _merge$pName$actions;

            if (!merge[pName]) {
                merge[pName] = { name: pName, label: pName, actions: [], params: [] };
            }
            (_merge$pName$actions = merge[pName].actions).push.apply(_merge$pName$actions, _toConsumableArray(allActions[pName]));
        });

        var allData = _pydioUtilLang2["default"].objectValues(merge);

        allData.map((function (plugin) {
            var params = [];
            var pluginMatch = false;
            var pluginLabel = plugin.label || plugin.name;
            if (filter(pluginLabel) || filter(plugin.name)) {
                pluginMatch = true;
                if (filter(pluginLabel)) {
                    pluginLabel = highlight(pluginLabel);
                } else if (filter(plugin.name)) {
                    pluginLabel = _react2["default"].createElement(
                        "span",
                        null,
                        pluginLabel,
                        " (",
                        highlight(plugin.name),
                        ")"
                    );
                }
            }

            plugin.params.concat(plugin.actions).map((function (param) {
                var name = param.action || param.parameter;
                var label = param.label || name;
                var prefix = '';
                if (param.action) {
                    label = _pydioUtilXml2["default"].XPathGetSingleNodeText(param.xmlNode, "gui/@text") || label;
                    prefix = this.props.actionsPrefix;
                } else {
                    label = param.xmlNode.getAttribute("label") || label;
                    if (this.props.parametersPrefix) {
                        prefix = this.props.parametersPrefix;
                    }
                }
                if (pydio.MessageHash[label]) {
                    label = pydio.MessageHash[label];
                }
                var filterLabel = filter(label);
                var filterName = filter(name);
                if (filterLabel || filterName || pluginMatch) {
                    var click = (function () {
                        this.select(plugin.name, param.action ? 'action' : 'parameter', name, param);
                    }).bind(this);
                    var selected = (selectedPlugin === '*' || selectedPlugin === plugin.name) && param[selectionType] && selection === name;
                    var highlighted = label;
                    if (filterLabel) {
                        highlighted = highlight(label);
                    } else if (filterName) {
                        highlighted = _react2["default"].createElement(
                            "span",
                            null,
                            label,
                            " (",
                            highlight(name),
                            ") "
                        );
                    }
                    params.push(_react2["default"].createElement(
                        "li",
                        {
                            onClick: click,
                            className: (selected ? "selected " : "") + "parameters-param",
                            key: plugin.name + '-' + (param.action ? 'action' : 'parameter') + '-' + name },
                        prefix,
                        " ",
                        highlighted
                    ));
                }
            }).bind(this));

            if (params.length) {
                entries.push(_react2["default"].createElement(
                    "li",
                    { className: "parameters-plugin", key: plugin.name },
                    pluginLabel,
                    _react2["default"].createElement(
                        "ul",
                        null,
                        params
                    )
                ));
            }
        }).bind(this));

        return _react2["default"].createElement(
            "div",
            null,
            _react2["default"].createElement(
                "div",
                { style: { padding: '0 24px', borderBottom: '1px solid #e0e0e0' } },
                _react2["default"].createElement(_materialUi.TextField, { ref: "input", floatingLabelText: this.props.getMessage('13'), onChange: this.filter, fullWidth: true, underlineShow: false })
            ),
            _react2["default"].createElement(
                "div",
                { className: "parameters-tree-scroller" },
                _react2["default"].createElement(
                    "ul",
                    { className: "parameters-tree" },
                    entries
                )
            )
        );
    }

});

exports["default"] = ParametersPicker;
module.exports = exports["default"];

},{"material-ui":"material-ui","pydio/util/lang":"pydio/util/lang","pydio/util/xml":"pydio/util/xml","react":"react"}],27:[function(require,module,exports){
(function (global){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modelUser = require('../model/User');

var _modelUser2 = _interopRequireDefault(_modelUser);

var React = require('react');

var _require = require('material-ui');

var TextField = _require.TextField;

var Pydio = require('pydio');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;
var CancelButtonProviderMixin = _Pydio$requireLib.CancelButtonProviderMixin;
var SubmitButtonProviderMixin = _Pydio$requireLib.SubmitButtonProviderMixin;

var PassUtils = require('pydio/util/pass');
exports['default'] = React.createClass({
    displayName: 'UserPasswordDialog',

    mixins: [AdminComponents.MessagesConsumerMixin, ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin],

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio),
        user: React.PropTypes.instanceOf(_modelUser2['default'])
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: pydio.MessageHash['role_editor.25'],
            dialogSize: 'sm'
        };
    },

    getInitialState: function getInitialState() {
        var pwdState = PassUtils.getState();
        return _extends({}, pwdState);
    },

    onChange: function onChange(event, value) {
        var passValue = this.refs.pass.getValue();
        var confirmValue = this.refs.confirm.getValue();
        var newState = PassUtils.getState(passValue, confirmValue, this.state);
        this.setState(newState);
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText);
            return;
        }

        var value = this.refs.pass.getValue();
        var user = this.props.user;

        user.getIdmUser().Password = value;
        user.save().then(function () {
            _this.dismiss();
        });
    },

    render: function render() {

        // This is passed via state, context is not working,
        // so we have to get the messages from the global.
        var getMessage = function getMessage(id) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            return global.pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        };
        return React.createElement(
            'div',
            { style: { width: '100%' } },
            React.createElement(TextField, { ref: 'pass', type: 'password', fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('523'),
                errorText: this.state.passErrorText,
                hintText: this.state.passHintText
            }),
            React.createElement(TextField, { ref: 'confirm', type: 'password', fullWidth: true,
                onChange: this.onChange,
                floatingLabelText: getMessage('199'),
                errorText: this.state.confirmErrorText
            })
        );
    }

});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../model/User":21,"material-ui":"material-ui","pydio":"pydio","pydio/util/pass":"pydio/util/pass","react":"react"}],28:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _utilMessagesMixin = require('../util/MessagesMixin');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

exports['default'] = _react2['default'].createClass({
    displayName: 'UserRolesPicker',

    mixins: [_utilMessagesMixin.RoleMessagesConsumerMixin],

    propTypes: {
        roles: _react2['default'].PropTypes.array,
        addRole: _react2['default'].PropTypes.func,
        removeRole: _react2['default'].PropTypes.func,
        switchRoles: _react2['default'].PropTypes.func
    },

    getInitialState: function getInitialState() {
        return {
            availableRoles: []
        };
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        _pydioHttpApi2['default'].getRestClient().getIdmApi().listRoles().then(function (roles) {
            _this.setState({ availableRoles: roles });
        });
    },

    onChange: function onChange(e, selectedIndex, value) {
        if (value === -1) {
            return;
        }
        this.props.addRole(value);
    },

    remove: function remove(value) {
        var availableRoles = this.state.availableRoles;

        var role = availableRoles.filter(function (r) {
            return r.Uuid === value;
        })[0];
        this.props.removeRole(role);
    },

    orderUpdated: function orderUpdated(oldId, newId, currentValues) {
        this.props.switchRoles(oldId, newId);
    },

    render: function render() {

        var groups = [],
            manual = [],
            users = [];
        var ctx = this.context;
        var _props = this.props;
        var roles = _props.roles;
        var loadingMessage = _props.loadingMessage;
        var availableRoles = this.state.availableRoles;

        roles.map((function (r) {
            if (r.GroupRole) {
                if (r.Uuid === 'ROOT_GROUP') {
                    groups.push('/ ' + ctx.getMessage('user.25', 'ajxp_admin'));
                } else {
                    groups.push(ctx.getMessage('user.26', 'ajxp_admin').replace('%s', r.Label || r.Uuid));
                }
            } else if (r.UserRole) {
                users.push(ctx.getMessage('user.27', 'ajxp_admin'));
            } else {
                /*
                if(rolesDetails[r].sticky) {
                    label += ' [' + ctx.getMessage('19') + ']';
                } // always overrides
                */
                manual.push({ payload: r.Uuid, text: r.Label });
            }
        }).bind(this));

        var addableRoles = [_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: ctx.getMessage('20') })].concat(_toConsumableArray(availableRoles.filter(function (r) {
            return roles.indexOf(r) === -1;
        }).map(function (r) {
            return _react2['default'].createElement(_materialUi.MenuItem, { value: r, primaryText: r.Label || r.Uuid });
        })));

        var fixedRoleStyle = {
            padding: 10,
            fontSize: 14,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            margin: '8px 0'
        };

        return _react2['default'].createElement(
            'div',
            { className: 'user-roles-picker', style: { padding: 0, marginBottom: 20 } },
            _react2['default'].createElement(
                'div',
                { style: { paddingLeft: 22, marginTop: -40, display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1, color: '#bdbdbd', fontWeight: 500 } },
                    ctx.getMessage('roles.picker.title'),
                    ' ',
                    loadingMessage ? ' (' + ctx.getMessage('21') + ')' : ''
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'roles-picker-menu', style: { marginTop: -12 } },
                    _react2['default'].createElement(
                        _materialUi.DropDownMenu,
                        { onChange: this.onChange, value: -1 },
                        addableRoles
                    )
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'roles-list', style: { margin: '0 16px' } },
                groups.map(function (g) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "group-" + g, style: fixedRoleStyle },
                        g
                    );
                }),
                _react2['default'].createElement(PydioComponents.SortableList, {
                    key: 'sortable',
                    values: manual,
                    removable: true,
                    onRemove: this.remove,
                    onOrderUpdated: this.orderUpdated,
                    itemClassName: 'role-item role-item-sortable'
                }),
                users.map(function (u) {
                    return _react2['default'].createElement(
                        'div',
                        { key: "user-" + u, style: fixedRoleStyle },
                        u
                    );
                })
            )
        );
    }

});
module.exports = exports['default'];

},{"../util/MessagesMixin":29,"material-ui":"material-ui","pydio/http/api":"pydio/http/api","react":"react"}],29:[function(require,module,exports){
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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var RoleMessagesConsumerMixin = {
    contextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        getPydioRoleMessage: React.PropTypes.func,
        getRootMessage: React.PropTypes.func
    }
};

var RoleMessagesProviderMixin = {

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        getPydioRoleMessage: React.PropTypes.func,
        getRootMessage: React.PropTypes.func
    },

    getChildContext: function getChildContext() {
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

};

exports.RoleMessagesConsumerMixin = RoleMessagesConsumerMixin;
exports.RoleMessagesProviderMixin = RoleMessagesProviderMixin;

},{}],30:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _materialUi = require('material-ui');

var CreateRoleOrGroupForm = _react2['default'].createClass({
    displayName: 'CreateRoleOrGroupForm',

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    propTypes: {
        type: _react2['default'].PropTypes.oneOf(['group', 'user', 'role']),
        roleNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    getTitle: function getTitle() {
        if (this.props.type === 'group') {
            return this.context.getMessage('ajxp_admin.user.15');
        } else {
            return this.context.getMessage('ajxp_admin.user.14');
        }
    },

    getPadding: function getPadding() {
        return true;
    },

    getSize: function getSize() {
        return 'sm';
    },

    dismiss: function dismiss() {
        return this.props.onDismiss();
    },

    getInitialState: function getInitialState() {
        return {
            groupId: '',
            groupIdError: this.context.getMessage('ajxp_admin.user.16.empty'),
            groupLabel: '',
            groupLabelError: this.context.getMessage('ajxp_admin.user.17.empty'),
            roleId: '',
            roleIdError: this.context.getMessage('ajxp_admin.user.18.empty')
        };
    },

    submit: function submit() {
        var _this = this;

        var _props = this.props;
        var type = _props.type;
        var pydio = _props.pydio;
        var reload = _props.reload;

        var currentNode = undefined;
        var _state = this.state;
        var groupId = _state.groupId;
        var groupIdError = _state.groupIdError;
        var groupLabel = _state.groupLabel;
        var groupLabelError = _state.groupLabelError;
        var roleId = _state.roleId;
        var roleIdError = _state.roleIdError;

        if (type === "group") {
            if (groupIdError || groupLabelError) {
                return;
            }
            if (pydio.getContextHolder().getSelectedNodes().length) {
                currentNode = pydio.getContextHolder().getSelectedNodes()[0];
            } else {
                currentNode = pydio.getContextNode();
            }
            var currentPath = currentNode.getPath().replace('/idm/users', '');
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createGroup(currentPath || '/', groupId, groupLabel).then(function () {
                _this.dismiss();
                currentNode.reload();
            });
        } else if (type === "role") {
            if (roleIdError) {
                return;
            }
            currentNode = this.props.roleNode;
            _pydioHttpApi2['default'].getRestClient().getIdmApi().createRole(roleId).then(function () {
                _this.dismiss();
                if (reload) {
                    reload();
                }
            });
        }
    },

    update: function update(state) {
        if (state.groupId !== undefined) {
            var re = new RegExp(/^[0-9A-Z\-_.:\+]+$/i);
            if (!re.test(state.groupId)) {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.format');
            } else if (state.groupId === '') {
                state.groupIdError = this.context.getMessage('ajxp_admin.user.16.empty');
            } else {
                state.groupIdError = '';
            }
        } else if (state.groupLabel !== undefined) {
            if (state.groupLabel === '') {
                state.groupLabelError = this.context.getMessage('ajxp_admin.user.17.empty');
            } else {
                state.groupLabelError = '';
            }
        } else if (state.roleId !== undefined) {
            if (state.roleId === '') {
                state.roleIdError = this.context.getMessage('ajxp_admin.user.18.empty');
            } else {
                state.roleIdError = '';
            }
        }
        this.setState(state);
    },

    render: function render() {
        var _this2 = this;

        var _state2 = this.state;
        var groupId = _state2.groupId;
        var groupIdError = _state2.groupIdError;
        var groupLabel = _state2.groupLabel;
        var groupLabelError = _state2.groupLabelError;
        var roleId = _state2.roleId;
        var roleIdError = _state2.roleIdError;

        if (this.props.type === 'group') {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(_materialUi.TextField, {
                    value: groupId,
                    errorText: groupIdError,
                    onChange: function (e, v) {
                        _this2.update({ groupId: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.16')
                }),
                _react2['default'].createElement(_materialUi.TextField, {
                    value: groupLabel,
                    errorText: groupLabelError,
                    onChange: function (e, v) {
                        _this2.update({ groupLabel: v });
                    },
                    fullWidth: true,
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.17')
                })
            );
        } else {
            return _react2['default'].createElement(
                'div',
                { style: { width: '100%' } },
                _react2['default'].createElement(_materialUi.TextField, {
                    value: roleId,
                    errorText: roleIdError,
                    onChange: function (e, v) {
                        _this2.update({ roleId: v });
                    },
                    floatingLabelText: this.context.getMessage('ajxp_admin.user.18')
                })
            );
        }
    }

});

exports['default'] = CreateRoleOrGroupForm;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node","react":"react"}],31:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _materialUi = require('material-ui');

var _pydioUtilPass = require('pydio/util/pass');

var _pydioUtilPass2 = _interopRequireDefault(_pydioUtilPass);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var CreateUserForm = _react2['default'].createClass({
    displayName: 'CreateUserForm',

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(PydioDataModel),
        openRoleEditor: _react2['default'].PropTypes.func
    },

    mixins: [AdminComponents.MessagesConsumerMixin, PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin, PydioReactUI.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogSize: 'sm',
            dialogTitleId: 'ajxp_admin.user.19'
        };
    },

    getInitialState: function getInitialState() {
        var passState = _pydioUtilPass2['default'].getState();
        return _extends({
            step: 1
        }, passState);
    },

    checkPassword: function checkPassword() {
        var value1 = this.refs.pass.getValue();
        var value2 = this.refs.passconf.getValue();
        this.setState(_pydioUtilPass2['default'].getState(value1, value2, this.state));
    },

    // Check valid login
    checkLogin: function checkLogin(e, v) {
        var err = _pydioUtilPass2['default'].isValidLogin(v);
        this.setState({ loginErrorText: err });
    },

    submit: function submit() {
        var _this = this;

        if (!this.state.valid || this.state.loginErrorText) {
            this.props.pydio.UI.displayMessage('ERROR', this.state.passErrorText || this.state.confirmErrorText || this.state.loginErrorText);
            return;
        }

        var ctxNode = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctxNode.getPath();
        if (currentPath.startsWith("/idm/users")) {
            currentPath = currentPath.substr("/idm/users".length);
        }
        var login = this.refs.user_id.getValue();
        var pwd = this.refs.pass.getValue();

        _pydioHttpApi2['default'].getRestClient().getIdmApi().createUser(currentPath, login, pwd).then(function (idmUser) {
            _this.dismiss();
            ctxNode.reload();
            var node = new _pydioModelNode2['default'](currentPath + "/" + login, true);
            node.getMetadata().set("ajxp_mime", "user");
            node.getMetadata().set("IdmUser", idmUser);
            _this.props.openRoleEditor(node);
        });
    },

    render: function render() {
        var ctx = this.props.dataModel.getUniqueNode() || this.props.dataModel.getContextNode();
        var currentPath = ctx.getPath();
        var path = undefined;
        if (currentPath.startsWith("/idm/users")) {
            path = currentPath.substr("/idm/users".length);
            if (path) {
                path = _react2['default'].createElement(
                    'div',
                    null,
                    this.context.getMessage('ajxp_admin.user.20').replace('%s', path)
                );
            }
        }
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' } },
            path,
            _react2['default'].createElement(
                'form',
                { autoComplete: "off" },
                _react2['default'].createElement(
                    'div',
                    { style: { width: '100%' } },
                    _react2['default'].createElement(_materialUi.TextField, {
                        ref: 'user_id',
                        onChange: this.checkLogin,
                        fullWidth: true,
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.21'),
                        errorText: this.state.loginErrorText,
                        autoComplete: "nope"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TextField, {
                        ref: 'pass',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.22'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.passErrorText || this.state.passHintText,
                        autoComplete: "new-password"
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TextField, {
                        ref: 'passconf',
                        type: 'password',
                        floatingLabelText: this.context.getMessage('ajxp_admin.user.23'),
                        onChange: this.checkPassword,
                        fullWidth: true,
                        errorText: this.state.confirmErrorText,
                        autoComplete: "confirm-password"
                    })
                )
            )
        );
    }
});

exports['default'] = CreateUserForm;
module.exports = exports['default'];

},{"material-ui":"material-ui","pydio/http/api":"pydio/http/api","pydio/model/node":"pydio/model/node","pydio/util/pass":"pydio/util/pass","react":"react"}],32:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardRolesDashboard = require('./board/RolesDashboard');

var _boardRolesDashboard2 = _interopRequireDefault(_boardRolesDashboard);

var _boardPoliciesBoard = require('./board/PoliciesBoard');

var _boardPoliciesBoard2 = _interopRequireDefault(_boardPoliciesBoard);

var _boardCallbacks = require('./board/Callbacks');

var _boardCallbacks2 = _interopRequireDefault(_boardCallbacks);

var _formsCreateUserForm = require('./forms/CreateUserForm');

var _formsCreateUserForm2 = _interopRequireDefault(_formsCreateUserForm);

var _formsCreateRoleOrGroupForm = require('./forms/CreateRoleOrGroupForm');

var _formsCreateRoleOrGroupForm2 = _interopRequireDefault(_formsCreateRoleOrGroupForm);

var _editorEditor = require('./editor/Editor');

var _editorEditor2 = _interopRequireDefault(_editorEditor);

var _editorUserUserPasswordDialog = require('./editor/user/UserPasswordDialog');

var _editorUserUserPasswordDialog2 = _interopRequireDefault(_editorUserUserPasswordDialog);

var _editorUserUserRolesPicker = require('./editor/user/UserRolesPicker');

var _editorUserUserRolesPicker2 = _interopRequireDefault(_editorUserUserRolesPicker);

var _editorPanelSharesList = require('./editor/panel/SharesList');

var _editorPanelSharesList2 = _interopRequireDefault(_editorPanelSharesList);

var _editorUtilMessagesMixin = require('./editor/util/MessagesMixin');

var _editorParamsParameterCreate = require('./editor/params/ParameterCreate');

var _editorParamsParameterCreate2 = _interopRequireDefault(_editorParamsParameterCreate);

window.AdminPeople = {
  RoleEditor: _editorEditor2['default'],
  RoleMessagesConsumerMixin: _editorUtilMessagesMixin.RoleMessagesConsumerMixin,
  UserPasswordDialog: _editorUserUserPasswordDialog2['default'],
  UserRolesPicker: _editorUserUserRolesPicker2['default'],
  SharesList: _editorPanelSharesList2['default'],
  CreateUserForm: _formsCreateUserForm2['default'],
  CreateRoleOrGroupForm: _formsCreateRoleOrGroupForm2['default'],
  ParameterCreate: _editorParamsParameterCreate2['default'],
  Callbacks: _boardCallbacks2['default'],

  Dashboard: _boardDashboard2['default'],
  RolesDashboard: _boardRolesDashboard2['default'],
  PoliciesBoard: _boardPoliciesBoard2['default']
};

},{"./board/Callbacks":3,"./board/Dashboard":4,"./board/PoliciesBoard":5,"./board/RolesDashboard":6,"./editor/Editor":8,"./editor/panel/SharesList":22,"./editor/params/ParameterCreate":23,"./editor/user/UserPasswordDialog":27,"./editor/user/UserRolesPicker":28,"./editor/util/MessagesMixin":29,"./forms/CreateRoleOrGroupForm":30,"./forms/CreateUserForm":31}],33:[function(require,module,exports){
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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _materialUi = require('material-ui');

var _editorInlineLabel = require('./editor/InlineLabel');

var _editorInlineLabel2 = _interopRequireDefault(_editorInlineLabel);

var _uuid4 = require('uuid4');

var _uuid42 = _interopRequireDefault(_uuid4);

var Policy = (function (_React$Component) {
    _inherits(Policy, _React$Component);

    function Policy(props) {
        _classCallCheck(this, Policy);

        _get(Object.getPrototypeOf(Policy.prototype), 'constructor', this).call(this, props);
        this.state = { policy: props.policy };
    }

    _createClass(Policy, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next) {
            this.setState({ policy: next.policy });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.newPolicyWithRule) {
                this.onAddRule(null, this.props.newPolicyWithRule);
            }
        }
    }, {
        key: 'onNameChange',
        value: function onNameChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Name = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onDescriptionChange',
        value: function onDescriptionChange(value) {
            var policy = _extends({}, this.state.policy);
            policy.Description = value;
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRuleChange',
        value: function onRuleChange(rule) {

            var policy = _extends({}, this.state.policy);

            if (policy.Policies) {
                policy.Policies = policy.Policies.filter(function (p) {
                    return p.id !== rule.id;
                });
                policy.Policies.push(rule);
            } else {
                policy.Policies = [rule];
            }
            this.props.savePolicy(policy);
        }
    }, {
        key: 'onRemoveRule',
        value: function onRemoveRule(rule) {
            var dontSave = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var policy = _extends({}, this.state.policy);
            policy.Policies = policy.Policies.filter(function (p) {
                return p.id !== rule.id;
            });
            this.props.savePolicy(policy, dontSave);
        }
    }, {
        key: 'onDeletePolicy',
        value: function onDeletePolicy() {
            if (window.confirm('Are you sure you want to delete this policy? This may break the security model of the application!')) {
                this.props.deletePolicy(this.state.policy);
            }
        }
    }, {
        key: 'onAddRule',
        value: function onAddRule(event) {
            var _this = this;

            var ruleLabel = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

            var label = ruleLabel;
            var policy = _extends({}, this.state.policy);
            if (!policy.Policies) {
                policy.Policies = [];
            }
            var newId = (0, _uuid42['default'])();
            var subjects = [],
                resources = [],
                actions = [];
            if (policy.ResourceGroup === "acl") {
                subjects = ["policy:" + policy.Uuid];
                resources = ["acl"];
            } else if (policy.ResourceGroup === "oidc") {
                resources = ["oidc"];
            }
            policy.Policies.push({
                id: newId,
                description: label,
                actions: actions,
                subjects: subjects,
                resources: resources,
                effect: "deny"
            });
            this.setState({ policy: policy, openRule: newId }, function () {
                _this.setState({ openRule: null });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var readonly = this.props.readonly;
            var _state = this.state;
            var policy = _state.policy;
            var openRule = _state.openRule;

            var nestedItems = policy.Policies.map(function (rule) {
                return _react2['default'].createElement(_Rule2['default'], _extends({}, _this2.props, {
                    key: rule.description,
                    rule: rule,
                    create: openRule === rule.id,
                    onRuleChange: _this2.onRuleChange.bind(_this2),
                    onRemoveRule: _this2.onRemoveRule.bind(_this2)
                }));
            });

            if (!readonly) {
                var buttonsContent = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: "Add New Rule", onTouchTap: this.onAddRule.bind(this) }),
                    '  ',
                    _react2['default'].createElement(_materialUi.RaisedButton, { label: "Delete Policy", onTouchTap: this.onDeletePolicy.bind(this) })
                );
                nestedItems.push(_react2['default'].createElement(_materialUi.ListItem, {
                    primaryText: buttonsContent,
                    disabled: true
                }));
            }

            var ruleWord = 'rule';
            var policyNumber = policy.Policies.length;
            if (policyNumber > 1) {
                ruleWord = 'rules';
            }
            var legend = _react2['default'].createElement(
                'span',
                null,
                '(',
                policyNumber,
                ' ',
                ruleWord,
                ')'
            );
            var primaryText = undefined,
                secondaryText = undefined;
            var secondaryStyle = { fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' };
            if (readonly) {
                primaryText = policy.Name;
                secondaryText = _react2['default'].createElement(
                    'div',
                    { style: secondaryStyle },
                    policy.Description
                );
            } else {
                primaryText = _react2['default'].createElement(_editorInlineLabel2['default'], { label: policy.Name, onChange: this.onNameChange.bind(this) });
                secondaryText = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_editorInlineLabel2['default'], { onChange: this.onDescriptionChange.bind(this), inputStyle: { fontSize: 14, color: 'rgba(0, 0, 0, 0.54)' }, label: policy.Description, legend: legend })
                );
            }

            return _react2['default'].createElement(_materialUi.ListItem, _extends({}, this.props, {
                primaryText: primaryText,
                secondaryText: secondaryText,
                nestedItems: nestedItems,
                primaryTogglesNestedList: false,
                disabled: true,
                initiallyOpen: !!this.props.newPolicyWithRule
            }));
        }
    }]);

    return Policy;
})(_react2['default'].Component);

exports['default'] = Policy;
module.exports = exports['default'];

},{"./Rule":34,"./editor/InlineLabel":39,"material-ui":"material-ui","react":"react","uuid4":2}],34:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorRuleEditor = require('./editor/RuleEditor');

var _editorRuleEditor2 = _interopRequireDefault(_editorRuleEditor);

var Rule = (function (_React$Component) {
    _inherits(Rule, _React$Component);

    function Rule() {
        _classCallCheck(this, Rule);

        _get(Object.getPrototypeOf(Rule.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Rule, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.create) {
                this.openEditor();
            }
        }
    }, {
        key: 'openEditor',
        value: function openEditor() {
            var _props = this.props;
            var pydio = _props.pydio;
            var policy = _props.policy;
            var rule = _props.rule;
            var openRightPane = _props.openRightPane;

            if (this.refs.editor && this.refs.editor.isDirty()) {
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            var editorData = {
                COMPONENT: _editorRuleEditor2['default'],
                PROPS: {
                    ref: "editor",
                    policy: policy,
                    rule: rule,
                    pydio: pydio,
                    saveRule: this.props.onRuleChange,
                    create: this.props.create,
                    onRequestTabClose: this.closeEditor.bind(this)
                }
            };
            openRightPane(editorData);
            return true;
        }
    }, {
        key: 'closeEditor',
        value: function closeEditor(editor) {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var closeRightPane = _props2.closeRightPane;

            if (editor && editor.isDirty()) {
                if (editor.isCreate()) {
                    this.props.onRemoveRule(this.props.rule, true);
                    closeRightPane();
                    return true;
                }
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            closeRightPane();
            return true;
        }
    }, {
        key: 'removeRule',
        value: function removeRule() {
            if (window.confirm('Are you sure you want to remove this security rule?')) {
                this.props.onRemoveRule(this.props.rule);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var rule = _props3.rule;
            var readonly = _props3.readonly;

            var iconColor = rule.effect === 'allow' ? '#33691e' : '#d32f2f';
            var buttons = [];
            if (!readonly) {
                buttons = [_react2['default'].createElement('span', { className: 'mdi mdi-delete', style: { color: '#9e9e9e', cursor: 'pointer', marginLeft: 5 }, onTouchTap: this.removeRule.bind(this) }), _react2['default'].createElement('span', { className: 'mdi mdi-pencil', style: { color: '#9e9e9e', cursor: 'pointer', marginLeft: 5 }, onTouchTap: this.openEditor.bind(this) })];
            }
            var label = _react2['default'].createElement(
                'div',
                null,
                rule.description,
                buttons
            );

            return _react2['default'].createElement(_materialUi.ListItem, _extends({}, this.props, {
                style: { fontStyle: 'italic', fontSize: 15 },
                primaryText: label,
                leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: iconColor }),
                disabled: true
            }));
        }
    }]);

    return Rule;
})(_react2['default'].Component);

exports['default'] = Rule;
module.exports = exports['default'];

},{"./editor/RuleEditor":42,"material-ui":"material-ui","react":"react"}],35:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ChipValues = require('./ChipValues');

var _ChipValues2 = _interopRequireDefault(_ChipValues);

var Actions = (function (_React$Component) {
    _inherits(Actions, _React$Component);

    function Actions() {
        _classCallCheck(this, Actions);

        _get(Object.getPrototypeOf(Actions.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Actions, [{
        key: 'onChange',
        value: function onChange(newValues) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { actions: newValues }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var rule = _props.rule;
            var policy = _props.policy;
            var containerStyle = _props.containerStyle;

            var presetValues = [];
            var allowAll = false;
            var allowFreeString = false;
            if (!policy.ResourceGroup || policy.ResourceGroup === 'rest') {
                presetValues = ["GET", "POST", "PATCH", "PUT", "OPTIONS"];
                allowAll = true;
            } else if (policy.ResourceGroup === 'acl') {
                presetValues = ["read", "write"];
                allowAll = true;
            } else if (policy.ResourceGroup === 'oidc') {
                presetValues = ["login"];
            }

            return _react2['default'].createElement(_ChipValues2['default'], {
                title: 'Actions',
                containerStyle: containerStyle,
                values: rule.actions,
                presetValues: presetValues,
                allowAll: allowAll,
                allowFreeString: allowFreeString,
                onChange: this.onChange.bind(this)
            });
        }
    }]);

    return Actions;
})(_react2['default'].Component);

exports['default'] = Actions;
module.exports = exports['default'];

},{"./ChipValues":36,"material-ui":"material-ui","react":"react"}],36:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ValuesOrRegexp = require('./ValuesOrRegexp');

var _ValuesOrRegexp2 = _interopRequireDefault(_ValuesOrRegexp);

var ChipValues = (function (_React$Component) {
    _inherits(ChipValues, _React$Component);

    function ChipValues() {
        _classCallCheck(this, ChipValues);

        _get(Object.getPrototypeOf(ChipValues.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ChipValues, [{
        key: 'addChip',
        value: function addChip(newValue) {
            if (this.props.values.find(function (v) {
                return v === newValue;
            })) {
                // value already there, ignore
                return;
            }
            var newValues = [].concat(_toConsumableArray(this.props.values), [newValue]);
            this.props.onChange(newValues);
        }
    }, {
        key: 'deleteChip',
        value: function deleteChip(chipValue) {
            var newValues = this.props.values.filter(function (v) {
                return v !== chipValue;
            });
            this.props.onChange(newValues);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var title = _props.title;
            var values = _props.values;
            var presetValues = _props.presetValues;
            var allowAll = _props.allowAll;
            var allowFreeString = _props.allowFreeString;
            var containerStyle = _props.containerStyle;
            var freeStringDefaultPrefix = _props.freeStringDefaultPrefix;
            var presetFreeStrings = _props.presetFreeStrings;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, containerStyle, { margin: '6px 16px', display: 'flex', alignItems: 'center' }) },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        title,
                        ' '
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' } },
                        values.map(function (a) {
                            return _react2['default'].createElement(
                                _materialUi.Chip,
                                { style: { marginRight: 10, marginBottom: 5 }, onRequestDelete: _this.deleteChip.bind(_this, a) },
                                a
                            );
                        }),
                        !values.length && _react2['default'].createElement(
                            'span',
                            { style: { fontStyle: 'italic', color: '#e9e9e9' } },
                            'Please provide at least one value'
                        )
                    ),
                    _react2['default'].createElement(_ValuesOrRegexp2['default'], {
                        presetValues: presetValues,
                        allowAll: allowAll,
                        allowFreeString: allowFreeString,
                        presetFreeStrings: presetFreeStrings,
                        onValueSelected: this.addChip.bind(this),
                        freeStringDefaultPrefix: freeStringDefaultPrefix
                    })
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }
    }]);

    return ChipValues;
})(_react2['default'].Component);

exports['default'] = ChipValues;
module.exports = exports['default'];

},{"./ValuesOrRegexp":44,"material-ui":"material-ui","react":"react"}],37:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Conditions = (function (_React$Component) {
    _inherits(Conditions, _React$Component);

    function Conditions(props) {
        _classCallCheck(this, Conditions);

        _get(Object.getPrototypeOf(Conditions.prototype), 'constructor', this).call(this, props);
        this.state = {};
    }

    _createClass(Conditions, [{
        key: 'onConditionAdd',
        value: function onConditionAdd(event, fieldName) {
            var _props = this.props;
            var rule = _props.rule;
            var pydio = _props.pydio;

            var fName = fieldName;
            if (fieldName === 'NodeMeta...') {
                var metaName = prompt('Please provide a metadata name. The condition will apply on the metadata value');
                if (metaName) {
                    fName = 'NodeMeta:' + metaName;
                } else {
                    pydio.UI.displayMessage('ERROR', 'Cannot add a NodeMeta condition without a metadata name');
                    return;
                }
            }
            if (!rule.conditions || !rule.conditions[fName]) {
                var conds = rule.conditions || {};
                var newConds = _extends({}, conds);
                newConds[fName] = { type: "", options: {}, jsonOptions: "{}" };
                this.setState(_defineProperty({}, fName + 'JsonInvalid', 'please provide a condition type'));
                this.props.onChange(_extends({}, rule, { conditions: newConds }));
            }
        }
    }, {
        key: 'onConditionRemove',
        value: function onConditionRemove(fieldName) {
            var rule = this.props.rule;

            var newConds = _extends({}, rule.conditions);
            delete newConds[fieldName];
            this.props.onChange(_extends({}, rule, { conditions: newConds }));
        }
    }, {
        key: 'onChange',
        value: function onChange(fieldName, event, newValue) {
            var rule = this.props.rule;

            var parsedValue = undefined;
            try {
                parsedValue = JSON.parse(newValue);
                if (!parsedValue.type) {
                    this.setState(_defineProperty({}, fieldName + 'JsonInvalid', 'please provide a condition type'));
                    return;
                }
            } catch (e) {
                this.setState(_defineProperty({}, fieldName + 'JsonInvalid', 'invalid json'));
                return;
            }
            this.setState(_defineProperty({}, fieldName + 'JsonInvalid', null));
            if (parsedValue.options) {
                parsedValue.jsonOptions = JSON.stringify(parsedValue.options);
            }
            var newConds = _extends({}, rule.conditions);
            newConds[fieldName] = parsedValue;
            this.props.onChange(_extends({}, rule, { conditions: newConds }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props2 = this.props;
            var rule = _props2.rule;
            var containerStyle = _props2.containerStyle;

            var conditions = [];
            if (rule.conditions) {
                (function () {
                    var i = 0;
                    conditions = Object.keys(rule.conditions).map(function (k) {
                        i++;
                        var displayCond = _extends({}, rule.conditions[k]);
                        if (displayCond.jsonOptions) {
                            displayCond.options = JSON.parse(displayCond.jsonOptions);
                            delete displayCond['jsonOptions'];
                        }
                        return _react2['default'].createElement(
                            'div',
                            { style: { marginLeft: 100 } },
                            _react2['default'].createElement(
                                'div',
                                { style: { display: 'flex', alignItems: 'baseline', marginTop: i == 1 ? -10 : 0 } },
                                k,
                                _react2['default'].createElement(
                                    'div',
                                    { style: { flex: 1 } },
                                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Remove Condition", onTouchTap: _this.onConditionRemove.bind(_this, k) })
                                ),
                                _react2['default'].createElement(
                                    'div',
                                    { style: { color: '#C62828', fontSize: 13, fontWeight: 500 } },
                                    _this.state[k + 'JsonInvalid']
                                )
                            ),
                            _react2['default'].createElement(
                                _materialUi.Paper,
                                { zDepth: 1 },
                                _react2['default'].createElement(AdminComponents.CodeMirrorField, {
                                    key: rule.id + '-' + k,
                                    mode: 'json',
                                    value: JSON.stringify(displayCond, null, 2),
                                    onChange: _this.onChange.bind(_this, k)
                                })
                            )
                        );
                    });
                })();
            }

            var fields = ["HEADER:Query Context", "RemoteAddress", "RequestMethod", "RequestURI", "HttpProtocol", "UserAgent", "ContentType", "CookiesString", "RemoteAddress", "ClientTime", "DIVIDER", "HEADER:Node Filters", "NodeMetaName", "NodeMetaPath", "NodeMetaExtension", /*"NodeMetaMimeType",*/"NodeMetaSize", "NodeMetaMTime"];

            /*"NodeMeta..."*/
            return _react2['default'].createElement(
                'div',
                { style: _extends({}, containerStyle, { margin: '6px 16px' }) },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        'Conditions'
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, flex: 1 } },
                        rule.conditions ? '' : 'No conditions set'
                    ),
                    _react2['default'].createElement(
                        _materialUi.IconMenu,
                        {
                            iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", tooltip: "Add value..." }),
                            onChange: this.onConditionAdd.bind(this),
                            maxHeight: 250
                        },
                        fields.map(function (k) {
                            if (k === 'DIVIDER') {
                                return _react2['default'].createElement(_materialUi.Divider, null);
                            } else if (k.startsWith("HEADER:")) {
                                return _react2['default'].createElement(
                                    _materialUi.Subheader,
                                    null,
                                    k.replace("HEADER:", "")
                                );
                            } else {
                                return _react2['default'].createElement(_materialUi.MenuItem, { primaryText: k, value: k });
                            }
                        })
                    )
                ),
                conditions
            );
        }
    }]);

    return Conditions;
})(_react2['default'].Component);

exports['default'] = Conditions;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],38:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Effect = (function (_React$Component) {
    _inherits(Effect, _React$Component);

    function Effect() {
        _classCallCheck(this, Effect);

        _get(Object.getPrototypeOf(Effect.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Effect, [{
        key: 'onChange',
        value: function onChange(event, newValue) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { effect: newValue }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            var styles = {
                allowColor: "#33691e",
                denyColor: "#d32f2f",
                radios: {
                    width: 130
                }
            };
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, containerStyle, { display: 'flex', alignItems: 'center', fontSize: 16 }) },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        'Effect'
                    ),
                    _react2['default'].createElement(
                        _materialUi.RadioButtonGroup,
                        { style: { display: 'flex', alignItems: 'center' }, name: "effect", valueSelected: rule.effect, defaultSelected: 'allow', onChange: this.onChange.bind(this) },
                        _react2['default'].createElement(_materialUi.RadioButton, { value: 'allow', label: 'Allow', style: styles.radios,
                            checkedIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: styles.allowColor }) }),
                        _react2['default'].createElement(_materialUi.RadioButton, { value: 'deny', label: 'Deny', style: styles.radios,
                            checkedIcon: _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: styles.denyColor }) })
                    )
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }
    }]);

    return Effect;
})(_react2['default'].Component);

exports['default'] = Effect;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],39:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var InlineLabel = (function (_React$Component) {
    _inherits(InlineLabel, _React$Component);

    function InlineLabel(props) {
        _classCallCheck(this, InlineLabel);

        _get(Object.getPrototypeOf(InlineLabel.prototype), 'constructor', this).call(this, props);
        this.state = { edit: false, hover: false, label: props.label };
    }

    _createClass(InlineLabel, [{
        key: 'onChange',
        value: function onChange(event, value) {
            this.setState({ label: value });
        }
    }, {
        key: 'onEnter',
        value: function onEnter(event) {
            if (event.key == "Enter") {
                this.setState({ edit: false });
                this.props.onChange(this.state.label);
            }
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            this.setState({ edit: false, hover: false, label: this.props.label });
        }
    }, {
        key: 'open',
        value: function open(event) {
            var _this = this;

            this.setState({
                edit: true,
                elementWidth: Math.max(event.target.offsetWidth, 256)
            }, function () {
                _this.refs.text.select();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var edit = _state.edit;
            var hover = _state.hover;
            var label = _state.label;

            if (edit) {
                return _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: '#f4f4f4' } },
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: this.state.elementWidth,
                        style: { marginTop: -20, width: this.state.elementWidth },
                        value: label,
                        onChange: this.onChange.bind(this),
                        onKeyDown: this.onEnter.bind(this),
                        underlineShow: false,
                        ref: 'text',
                        inputStyle: this.props.inputStyle,
                        onBlur: this.cancel.bind(this)
                    }),
                    ' ',
                    _react2['default'].createElement(
                        'span',
                        { style: { fontStyle: 'italic', opacity: 0.8 } },
                        '(Hit enter to save)'
                    )
                );
            } else {
                var editIcon = undefined;
                if (hover) {
                    editIcon = _react2['default'].createElement('span', { className: 'mdi mdi-pencil', style: { color: '#e0e0e0' }, onMouseOver: function () {
                            _this2.setState({ hover: true });
                        } });
                }
                return _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(
                        'span',
                        {
                            style: { pointer: 'cursor' },
                            title: 'Click to edit',
                            onClick: this.open.bind(this),
                            onMouseOver: function () {
                                _this2.setState({ hover: true });
                            },
                            onMouseOut: function () {
                                _this2.setState({ hover: false });
                            }
                        },
                        label,
                        ' ',
                        editIcon,
                        ' '
                    ),
                    this.props.legend
                );
            }
        }
    }]);

    return InlineLabel;
})(_react2['default'].Component);

exports['default'] = InlineLabel;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],40:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var Label = (function (_React$Component) {
    _inherits(Label, _React$Component);

    function Label() {
        _classCallCheck(this, Label);

        _get(Object.getPrototypeOf(Label.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Label, [{
        key: 'onChange',
        value: function onChange(event, newValue) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { description: newValue }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: _extends({}, containerStyle, { display: 'flex', alignItems: 'center', fontSize: 16, margin: '6px 16px' }) },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 100, fontWeight: 500 } },
                        'Label'
                    ),
                    _react2['default'].createElement(_materialUi.TextField, { underlineShow: false, fullWidth: true, value: rule.description, onChange: this.onChange.bind(this) })
                ),
                _react2['default'].createElement(_materialUi.Divider, null)
            );
        }
    }]);

    return Label;
})(_react2['default'].Component);

exports['default'] = Label;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}],41:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ChipValues = require('./ChipValues');

var _ChipValues2 = _interopRequireDefault(_ChipValues);

var Resources = (function (_React$Component) {
    _inherits(Resources, _React$Component);

    function Resources() {
        _classCallCheck(this, Resources);

        _get(Object.getPrototypeOf(Resources.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Resources, [{
        key: 'onChange',
        value: function onChange(newValues) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { resources: newValues }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var policy = _props.policy;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            if (policy.ResourceGroup === 'acl' || policy.ResourceGroup === 'oidc') {
                return null;
            }

            return _react2['default'].createElement(_ChipValues2['default'], {
                title: 'Resources',
                containerStyle: containerStyle,
                values: rule.resources,
                presetValues: [],
                allowAll: false,
                allowFreeString: true,
                freeStringDefaultPrefix: "rest:/",
                onChange: this.onChange.bind(this)
            });
        }
    }]);

    return Resources;
})(_react2['default'].Component);

exports['default'] = Resources;
module.exports = exports['default'];

},{"./ChipValues":36,"material-ui":"material-ui","react":"react"}],42:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Label = require('./Label');

var _Label2 = _interopRequireDefault(_Label);

var _Actions = require('./Actions');

var _Actions2 = _interopRequireDefault(_Actions);

var _Effect = require('./Effect');

var _Effect2 = _interopRequireDefault(_Effect);

var _Resources = require('./Resources');

var _Resources2 = _interopRequireDefault(_Resources);

var _Subjects = require('./Subjects');

var _Subjects2 = _interopRequireDefault(_Subjects);

var _Conditions = require('./Conditions');

var _Conditions2 = _interopRequireDefault(_Conditions);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;

var RuleEditor = (function (_React$Component) {
    _inherits(RuleEditor, _React$Component);

    function RuleEditor(props) {
        _classCallCheck(this, RuleEditor);

        _get(Object.getPrototypeOf(RuleEditor.prototype), 'constructor', this).call(this, props);
        this.state = {
            rule: props.rule,
            dirty: this.props.create,
            valid: !this.props.create,
            create: this.props.create
        };
    }

    _createClass(RuleEditor, [{
        key: 'isDirty',
        value: function isDirty() {
            return this.state.dirty;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return this.state.valid;
        }
    }, {
        key: 'isCreate',
        value: function isCreate() {
            return this.state.create;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            this.setState({ rule: newProps.rule });
        }
    }, {
        key: 'onChange',
        value: function onChange(rule) {
            var valid = rule.description && rule.actions.length && rule.resources.length && rule.subjects.length;
            this.setState({ rule: rule, dirty: true, valid: valid });
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.setState({ rule: this.props.rule, dirty: false });
        }
    }, {
        key: 'save',
        value: function save() {
            var rule = this.state.rule;

            this.props.saveRule(rule);
            this.setState({ dirty: false, create: false });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var messages = _pydio2['default'].getMessages();
            var _state = this.state;
            var rule = _state.rule;
            var dirty = _state.dirty;
            var valid = _state.valid;

            var actions = [];
            if (!this.isCreate()) {
                actions.push(PaperEditorLayout.actionButton(messages['ajxp_admin.plugins.6'], 'mdi mdi-undo', function () {
                    _this.revert();
                }, !dirty));
            }
            actions.push(PaperEditorLayout.actionButton(messages['53'], 'mdi mdi-content-save', function () {
                _this.save();
            }, !dirty || !valid));
            var containerStyle = { margin: 16, fontSize: 16 };

            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: rule.description || 'Please provide a label',
                    titleActionBar: actions,
                    closeAction: function () {
                        _this.props.onRequestTabClose();
                    },
                    contentFill: false
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_Label2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Effect2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Actions2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Resources2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Subjects2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Conditions2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle }))
                )
            );
        }
    }]);

    return RuleEditor;
})(_react2['default'].Component);

exports['default'] = RuleEditor;
module.exports = exports['default'];

},{"./Actions":35,"./Conditions":37,"./Effect":38,"./Label":40,"./Resources":41,"./Subjects":43,"material-ui":"material-ui","pydio":"pydio","react":"react"}],43:[function(require,module,exports){
/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _ChipValues = require('./ChipValues');

var _ChipValues2 = _interopRequireDefault(_ChipValues);

var Subjects = (function (_React$Component) {
    _inherits(Subjects, _React$Component);

    function Subjects() {
        _classCallCheck(this, Subjects);

        _get(Object.getPrototypeOf(Subjects.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Subjects, [{
        key: 'onChange',
        value: function onChange(newValues) {
            var rule = this.props.rule;

            this.props.onChange(_extends({}, rule, { subjects: newValues }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var policy = _props.policy;
            var rule = _props.rule;
            var containerStyle = _props.containerStyle;

            if (policy.ResourceGroup === 'acl') {
                return null;
            }

            return _react2['default'].createElement(_ChipValues2['default'], {
                title: 'Subjects',
                containerStyle: containerStyle,
                values: rule.subjects,
                presetValues: [],
                allowAll: true,
                allowFreeString: true,
                presetFreeStrings: { "user:": "User", "profile:": "Profile", "role:": "Role" },
                onChange: this.onChange.bind(this)
            });
        }
    }]);

    return Subjects;
})(_react2['default'].Component);

exports['default'] = Subjects;
module.exports = exports['default'];

},{"./ChipValues":36,"material-ui":"material-ui","react":"react"}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var ValuesOrRegexp = (function (_React$Component) {
    _inherits(ValuesOrRegexp, _React$Component);

    function ValuesOrRegexp(props) {
        _classCallCheck(this, ValuesOrRegexp);

        _get(Object.getPrototypeOf(ValuesOrRegexp.prototype), 'constructor', this).call(this, props);
        this.state = {
            showTextField: false,
            textFieldValue: ''
        };
    }

    _createClass(ValuesOrRegexp, [{
        key: 'onItemTouchTap',
        value: function onItemTouchTap(event, value) {
            var _this = this;

            var _props = this.props;
            var onValueSelected = _props.onValueSelected;
            var freeStringDefaultPrefix = _props.freeStringDefaultPrefix;

            if (value === -1 || value.startsWith("preset-free-string:")) {
                var prefix = freeStringDefaultPrefix ? freeStringDefaultPrefix : '';
                if (value !== -1) {
                    prefix = value.replace("preset-free-string:", "");
                }
                this.setState({
                    showTextField: true,
                    textFieldValue: prefix
                }, function () {
                    _this.refs.textField.focus();
                });
                return;
            }
            onValueSelected(value);
        }
    }, {
        key: 'onTextFieldSubmitted',
        value: function onTextFieldSubmitted() {
            var value = this.refs.textField.getValue();
            this.props.onValueSelected(value);
            this.setState({ showTextField: false, textFieldValue: '' });
        }
    }, {
        key: 'cancelTextField',
        value: function cancelTextField() {
            this.setState({ showTextField: false, textFieldValue: '' });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var presetValues = _props2.presetValues;
            var allowAll = _props2.allowAll;
            var allowFreeString = _props2.allowFreeString;
            var presetFreeStrings = _props2.presetFreeStrings;

            var items = [];
            if (presetValues) {
                items = presetValues.map(function (v) {
                    return _react2['default'].createElement(_materialUi.MenuItem, { value: v, primaryText: v });
                });
            }
            if (allowAll) {
                items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: "<.+>", primaryText: "Any values (*)" }));
            }

            if (allowFreeString) {
                if (items.length) {
                    items.push(_react2['default'].createElement(_materialUi.Divider, null));
                }
                if (presetFreeStrings) {
                    Object.keys(presetFreeStrings).map(function (k) {
                        items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: "preset-free-string:" + k, primaryText: presetFreeStrings[k] + "..." }));
                    });
                } else {
                    items.push(_react2['default'].createElement(_materialUi.MenuItem, { value: -1, primaryText: "Enter Free Value..." }));
                }
            }

            var editBoxStyle = {
                display: 'flex',
                position: 'absolute',
                right: 16,
                zIndex: 100,
                alignItems: 'center',
                backgroundColor: '#f4f4f4',
                paddingLeft: 10,
                borderRadius: 2
            };

            if (this.state.showTextField) {
                return _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        _materialUi.Paper,
                        { zDepth: 2, style: editBoxStyle },
                        _react2['default'].createElement(_materialUi.TextField, { style: { width: 200 }, ref: 'textField', hintText: "Enter free value...", defaultValue: this.state.textFieldValue }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-check", tooltip: "Add", onTouchTap: this.onTextFieldSubmitted.bind(this) }),
                        _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-cancel", tooltip: "Cancel", onTouchTap: this.cancelTextField.bind(this) })
                    ),
                    _react2['default'].createElement('div', { style: { height: 48 } })
                );
            } else {
                return _react2['default'].createElement(
                    _materialUi.IconMenu,
                    {
                        iconButtonElement: _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-plus", tooltip: "Add value..." }),
                        onChange: this.onItemTouchTap.bind(this)
                    },
                    items
                );
            }
        }
    }]);

    return ValuesOrRegexp;
})(_react2['default'].Component);

exports['default'] = ValuesOrRegexp;
module.exports = exports['default'];

},{"material-ui":"material-ui","react":"react"}]},{},[32]);
