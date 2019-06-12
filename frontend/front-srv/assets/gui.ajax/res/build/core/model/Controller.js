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

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

/**
 * Singleton class that manages all actions. Can be called directly using pydio.getController().
 */

var Controller = (function (_Observable) {
    _inherits(Controller, _Observable);

    /**
     * Standard constructor
     * @param pydioObject Pydio
     * @param dataModelElementId
     */

    function Controller(pydioObject) {
        var dataModelElementId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        _classCallCheck(this, Controller);

        _Observable.call(this);
        this._pydioObject = pydioObject;
        this._registeredKeys = new Map();
        this.usersEnabled = pydioObject.Parameters.get("usersEnabled");

        this.subMenus = [];
        this.actions = new Map();
        this.defaultActions = new Map();
        this.toolbars = new Map();
        this._guiActions = new Map();

        this.contextChangedObs = (function (event) {
            window.setTimeout((function () {
                this.fireContextChange();
            }).bind(this), 0);
        }).bind(this);
        this.selectionChangedObs = (function (event) {
            window.setTimeout((function () {
                this.fireSelectionChange();
            }).bind(this), 0);
        }).bind(this);

        if (dataModelElementId) {
            this.localDataModel = true;
            try {
                this._dataModel = document.getElementById(dataModelElementId).ajxpPaneObject.getDataModel();
            } catch (e) {}
            if (this._dataModel) {
                this._connectDataModel();
            } else {
                this._pydioObject.observeOnce("datamodel-loaded-" + dataModelElementId, (function () {
                    this._dataModel = document.getElementById(dataModelElementId).ajxpPaneObject.getDataModel();
                    this._connectDataModel();
                }).bind(this));
            }
        } else {
            this.localDataModel = false;
            this._connectDataModel();
        }

        if (this.usersEnabled) {
            this._pydioObject.observe("user_logged", (function (user) {
                this.setUser(user);
            }).bind(this));
            if (this._pydioObject.user) {
                this.setUser(this._pydioObject.user);
            }
        }
    }

    Controller.prototype.getPydio = function getPydio() {
        return this._pydioObject;
    };

    Controller.prototype.publishActionEvent = function publishActionEvent(eventName, data) {
        this._pydioObject.fire(eventName, data);
    };

    Controller.prototype._connectDataModel = function _connectDataModel() {
        if (this.localDataModel) {
            this._dataModel.observe("context_changed", this.contextChangedObs);
            this._dataModel.observe("selection_changed", this.selectionChangedObs);
            this.loadActionsFromRegistry();
            this._pydioObject.observe("registry_loaded", (function (registry) {
                this.loadActionsFromRegistry(registry);
            }).bind(this));
        } else {
            this._pydioObject.observe("context_changed", this.contextChangedObs);
            this._pydioObject.observe("selection_changed", this.selectionChangedObs);
            this._dataModel = this._pydioObject.getContextHolder();
        }
    };

    Controller.prototype.updateGuiActions = function updateGuiActions(actions) {
        actions.forEach((function (v, k) {
            if (!this._guiActions.has(k)) {
                this._guiActions.set(k, v);
                this.registerAction(v);
            }
        }).bind(this));
        this.notify("actions_refreshed");
    };

    Controller.prototype.deleteFromGuiActions = function deleteFromGuiActions(actionName) {
        this._guiActions['delete'](actionName);
        if (this.actions.has(actionName)) {
            this.actions['delete'](actionName);
        }
        this.notify("actions_refreshed");
    };

    Controller.prototype.refreshGuiActionsI18n = function refreshGuiActionsI18n() {
        this._guiActions.forEach(function (value, key) {
            value.refreshFromI18NHash();
        });
    };

    Controller.prototype.getDataModel = function getDataModel() {
        return this._dataModel;
    };

    Controller.prototype.destroy = function destroy() {
        if (this.localDataModel && this._dataModel) {
            this._dataModel.stopObserving("context_changed", this.contextChangedObs);
            this._dataModel.stopObserving("selection_changed", this.selectionChangedObs);
        }
    };

    Controller.prototype.getMessage = function getMessage(messageId) {
        try {
            return this._pydioObject.MessageHash[messageId];
        } catch (e) {
            return messageId;
        }
    };

    /**
     * Stores the currently logged user object
     * @param oUser User User instance
     */

    Controller.prototype.setUser = function setUser(oUser) {
        this.oUser = oUser;
        if (oUser != null && oUser.id !== 'guest' && oUser.getPreference('lang') != null && oUser.getPreference('lang') !== "" && oUser.getPreference('lang') !== this._pydioObject.currentLanguage && !oUser.lock) {
            this._pydioObject.loadI18NMessages(oUser.getPreference('lang'), false);
        }
    };

    /**
     * Filter the actions given the srcElement passed as arguments.
     * @param actionsSelectorAtt String An identifier among selectionContext, genericContext, a webfx object id
        * @param ignoreGroups Array a list of groups to ignore
     * @returns Array
     */

    Controller.prototype.getContextActions = function getContextActions(actionsSelectorAtt, ignoreGroups, onlyGroups) {
        var contextActions = [];
        var defaultGroup = undefined;
        var contextActionsGroup = new Map();
        this.actions.forEach((function (action) {
            if (!action.context.contextMenu && !(onlyGroups && onlyGroups.length)) return;
            if (actionsSelectorAtt == 'selectionContext' && !action.context.selection) return;
            if (actionsSelectorAtt == 'directoryContext' && !action.context.dir) return;
            if (actionsSelectorAtt == 'genericContext' && action.context.selection) return;
            if (action.contextHidden || action.deny) return;
            action.context.actionBarGroup.split(',').forEach(function (barGroup) {
                if (!contextActionsGroup.has(barGroup)) {
                    contextActionsGroup.set(barGroup, []);
                }
            });
            var isDefault = false;
            if (actionsSelectorAtt == 'selectionContext') {
                // set default in bold
                var userSelection = this._dataModel;
                if (!userSelection.isEmpty()) {
                    var defaultAction = 'file';
                    if (userSelection.isUnique() && (userSelection.hasDir() || userSelection.hasMime(['ajxp_browsable_archive']))) {
                        defaultAction = 'dir';
                    }
                    if (this.defaultActions.get(defaultAction) && action.options.name == this.defaultActions.get(defaultAction)) {
                        isDefault = true;
                    }
                }
            }
            action.context.actionBarGroup.split(',').forEach(function (barGroup) {
                var menuItem = action.getMenuData();
                menuItem.isDefault = isDefault;
                contextActionsGroup.get(barGroup).push(menuItem);
                if (isDefault) {
                    defaultGroup = barGroup;
                }
            });
        }).bind(this));
        var first = true,
            keys = [];
        contextActionsGroup = this._sortToolbarsActions(contextActionsGroup);
        contextActionsGroup.forEach(function (v, k) {
            if (defaultGroup && k == defaultGroup) return;
            keys.push(k);
        });
        keys.sort();
        if (defaultGroup && contextActionsGroup.has(defaultGroup)) {
            keys.unshift(defaultGroup);
        }
        var actionsPushed = {};
        keys.map(function (key) {
            var value = contextActionsGroup.get(key);
            if (!first) {
                contextActions.push({ separator: true });
            }
            if (ignoreGroups && ignoreGroups.indexOf(key) !== -1) {
                return;
            }
            if (onlyGroups && onlyGroups.indexOf(key) === -1) {
                return;
            }
            first = false;
            value.forEach(function (mItem) {
                var actionId = mItem.action_id;
                if (!actionsPushed[actionId]) {
                    contextActions.push(mItem);
                    actionsPushed[actionId] = true;
                }
            });
        });
        return contextActions;
    };

    Controller.prototype.getToolbarsActions = function getToolbarsActions() {
        var _this = this;

        var toolbarsList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var groupOtherList = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        var toolbars = new Map(),
            groupOtherBars = new Map();
        var lastTbarAdded = undefined;
        this.actions.forEach((function (action) {
            if (action.context.actionBar) {
                action.context.actionBarGroup.split(",").map((function (barGroup) {
                    if (toolbarsList.indexOf(barGroup) === -1 && groupOtherList.indexOf(barGroup) === -1) {
                        return;
                    }
                    var tBarUpdate = toolbarsList.indexOf(barGroup) !== -1 ? toolbars : groupOtherBars;
                    if (tBarUpdate.get(barGroup) == null) {
                        tBarUpdate.set(barGroup, []);
                    }
                    tBarUpdate.get(barGroup).push(action);
                    if (tBarUpdate === toolbars) {
                        lastTbarAdded = barGroup;
                    }
                }).bind(this));
            }
        }).bind(this));

        // Regroup actions artificially
        if (groupOtherList.length) {
            (function () {
                var submenuItems = [];
                groupOtherList.map((function (otherToolbar) {

                    var otherActions = groupOtherBars.get(otherToolbar);
                    if (!otherActions) return;
                    otherActions.map(function (act) {
                        submenuItems.push({ actionId: act });
                    });
                    if (groupOtherList.indexOf(otherToolbar) < groupOtherList.length - 1) {
                        submenuItems.push({ separator: true });
                    }
                }).bind(_this));
                var moreAction = new _Action2['default']({
                    name: 'group_more_action',
                    icon_class: 'icon-none',
                    text: MessageHash[456],
                    title: MessageHash[456],
                    hasAccessKey: false,
                    subMenu: true,
                    callback: function callback() {}
                }, {
                    selection: false,
                    dir: true,
                    actionBar: true,
                    actionBarGroup: '',
                    contextMenu: false,
                    infoPanel: false

                }, {}, {}, { dynamicItems: submenuItems });
                _this.registerAction(moreAction);
                _this.actions.set("group_more_action", moreAction);
                toolbars.set('MORE_ACTION', [moreAction]);
            })();
        }
        this._sortToolbarsActions(toolbars);
        return toolbars;
    };

    /**
     * Generic method to get actions for a given component part.
     * @param ajxpClassName String 
     * @param widgetId String
     * @returns []
     */

    Controller.prototype.getActionsForAjxpWidget = function getActionsForAjxpWidget(ajxpClassName, widgetId) {
        var actions = [];
        this.actions.forEach(function (action) {
            if (action.context.ajxpWidgets && (action.context.ajxpWidgets.indexOf(ajxpClassName + '::' + widgetId) != -1 || action.context.ajxpWidgets.indexOf(ajxpClassName) != -1) && !action.deny) actions.push(action);
        });
        return actions;
    };

    /**
     * Finds a default action and fires it.
     * @param defaultName String ("file", "dir", "dragndrop", "ctrldragndrop")
     */

    Controller.prototype.fireDefaultAction = function fireDefaultAction(defaultName) {
        var actionName = this.defaultActions.get(defaultName);
        if (actionName) {
            arguments[0] = actionName;
            if (actionName === "ls") {
                var action = this.actions.get(actionName);
                if (action) action.enable(); // Force enable on default action
            }
            this.fireAction.apply(this, arguments);
        }
    };

    /**
     * Fire an action based on its name
     * @param actionName String The name of the action
     */

    Controller.prototype.fireAction = function fireAction(actionName) {
        console.log(actionName);
        var action = this.actions.get(actionName);
        if (action != null) {
            var args = Array.from(arguments).slice(1);
            action.apply(args);
        }
    };

    /**
     * Registers an accesskey for a given action. 
     * @param key String The access key
     * @param actionName String The name of the action
     * @param optionnalCommand String An optionnal argument 
     * that will be passed to the action when fired.
     */

    Controller.prototype.registerKey = function registerKey(key, actionName, optionnalCommand) {
        if (optionnalCommand) {
            actionName = actionName + "::" + optionnalCommand;
        }
        this._registeredKeys.set(key.toLowerCase(), actionName);
    };

    /**
     * Remove all registered keys.
     */

    Controller.prototype.clearRegisteredKeys = function clearRegisteredKeys() {
        this._registeredKeys = new Map();
    };

    /**
     * Triggers an action by its access key.
     * @param keyName String A key name
     */

    Controller.prototype.fireActionByKey = function fireActionByKey(keyName) {
        if (this._registeredKeys.get(keyName)) {
            if (this._registeredKeys.get(keyName).indexOf("::") !== -1) {
                var parts = this._registeredKeys.get(keyName).split("::");
                this.fireAction(parts[0], parts[1]);
            } else {
                this.fireAction(this._registeredKeys.get(keyName));
            }
            return true;
        }
        return false;
    };

    /**
     * Get the action defined as default for a given default string
     * @param defaultName String
     * @returns Action
     */

    Controller.prototype.getDefaultAction = function getDefaultAction(defaultName) {
        if (this.defaultActions.has(defaultName)) {
            return this.actions.get(this.defaultActions.get(defaultName));
        }
        return null;
    };

    /**
     * Spreads a selection change to all actions and to registered components 
     */

    Controller.prototype.fireSelectionChange = function fireSelectionChange() {
        this.actions.forEach((function (action) {
            action.fireSelectionChange(this._dataModel);
        }).bind(this));
        this.notify("actions_refreshed");
    };

    /**
     * Spreads a context change to all actions and to registered components 
     * by triggering actions_refreshed event.
     */

    Controller.prototype.fireContextChange = function fireContextChange() {
        this.actions.forEach((function (action) {
            action.fireContextChange(this._dataModel, this.usersEnabled, this.oUser);
        }).bind(this));
        this.notify("actions_refreshed");
    };

    Controller.prototype.notify = function notify(eventName, memo) {
        if (this.localDataModel) {
            _Observable.prototype.notify.call(this, "actions_refreshed", memo);
        } else {
            this._pydioObject.fire("actions_refreshed");
        }
    };

    /**
     * Remove all actions
     */

    Controller.prototype.removeActions = function removeActions() {
        this.actions.forEach(function (action) {
            action.remove();
        });
        this.actions = new Map();
        this.clearRegisteredKeys();
    };

    /**
     * Create actions from XML Registry
     * @param registry DOMDocument
     */

    Controller.prototype.loadActionsFromRegistry = function loadActionsFromRegistry() {
        var registry = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        if (!registry) {
            registry = pydio.getXmlRegistry();
        }
        this.removeActions();
        this.parseActions(registry);
        this._guiActions.forEach((function (act) {
            this.registerAction(act);
        }).bind(this));
        this.notify("actions_loaded");
        this.fireContextChange();
        this.fireSelectionChange();
    };

    /**
     * Registers an action to this manager (default, accesskey).
     * @param action Action
     */

    Controller.prototype.registerAction = function registerAction(action) {
        var actionName = action.options.name;
        this.actions.set(actionName, action);
        if (action.defaults) {
            for (var key in action.defaults) {
                if (action.defaults.hasOwnProperty(key)) {
                    this.defaultActions.set(key, actionName);
                }
            }
        }
        if (action.options.hasAccessKey) {
            this.registerKey(action.options.accessKey, actionName);
        }
        if (action.options.specialAccessKey) {
            this.registerKey("key_" + action.options.specialAccessKey, actionName);
        }
        action.setManager(this);
    };

    /**
     * Parse an XML action node and registers the action
     * @param documentElement DOMNode The node to parse
     */

    Controller.prototype.parseActions = function parseActions(documentElement) {
        var actions = _utilXMLUtils2['default'].XPathSelectNodes(documentElement, "actions/action");
        for (var i = 0; i < actions.length; i++) {
            if (actions[i].nodeName != 'action') continue;
            if (actions[i].getAttribute('enabled') == 'false') continue;
            var newAction = new _Action2['default']();
            newAction.setManager(this);
            newAction.createFromXML(actions[i]);
            this.registerAction(newAction);
        }
    };

    /**
     * Find an action by its name
     * @param actionName String
     * @returns Action
     */

    Controller.prototype.getActionByName = function getActionByName(actionName) {
        return this.actions.get(actionName);
    };

    Controller.prototype._sortToolbarsActions = function _sortToolbarsActions(toolbars) {
        // Sort
        toolbars.forEach(function (v, k) {
            if (!v.sort) return;
            v.sort(function (a, b) {
                var wA = a.weight || a.options && a.options.weight || 0;
                var wB = b.weight || b.options && b.options.weight || 0;
                return wA === wB ? 0 : wA > wB ? 1 : -1;
            });
        });
        return toolbars;
    };

    return Controller;
})(_langObservable2['default']);

exports['default'] = Controller;
module.exports = exports['default'];
