"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.startJob = startJob;
exports.getConfigsAction = getConfigsAction;
exports.getUsersAction = getUsersAction;
exports.getAclsAction = getAclsAction;
exports.getWorkspacesAction = getWorkspacesAction;
exports.getWorkspacesSummary = getWorkspacesSummary;
exports.getSharesAction = getSharesAction;
exports.getSharesSummary = getSharesSummary;
exports.getMetadataAction = getMetadataAction;
exports.getMedataSummary = getMedataSummary;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require("pydio/http/api");

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _uuid4 = require("uuid4");

var _uuid42 = _interopRequireDefault(_uuid4);

var _pydioHttpRestApi = require('pydio/http/rest-api');

function T(id) {
    var m = _pydio2["default"].getInstance().MessageHash;
    return m['migration.action.' + id] || m['migration.' + id] || m[id] || id;
}

function startJob(state, onLocalUpdate) {
    var features = state.features;
    var cellAdmin = state.cellAdmin;

    var allActions = [];
    var sessionUuid = (0, _uuid42["default"])();
    Object.keys(features).forEach(function (k) {
        var feature = features[k];
        if (feature.value && typeof feature.action === "function") {
            feature.action(state, onLocalUpdate).map(function (a) {
                a.params = _extends({}, a.params, { cellAdmin: cellAdmin, sessionUuid: sessionUuid });
                allActions.push(a);
            });
        }
    });
    if (allActions.length) {
        _pydioHttpApi2["default"].getRestClient().userJob("import-p8", allActions).then(function (res) {
            console.log(res);
        })["catch"](function (err) {
            var msg = err.Detail || err.message || err;
            _pydio2["default"].getInstance().UI.displayMessage('ERROR', msg);
        });
    }
}

function getConfigsAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;

    return [{
        name: "actions.etl.configs",
        params: {
            left: "pydio8",
            right: "cells-local",
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false"
        }
    }];
}

function getUsersAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var cellAdmin = state.cellAdmin;

    return [{
        name: "actions.etl.users",
        params: {
            left: "pydio8",
            right: "cells-local",
            splitUsersRoles: "true",
            cellAdmin: cellAdmin,
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false"
        }
    }];
}

function getAclsAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var cellAdmin = state.cellAdmin;
    var workspaceMapping = state.workspaceMapping;

    return [{
        name: "actions.etl.p8-workspaces",
        params: {
            type: "pydio8",
            url: url,
            user: user,
            password: pwd,
            skipVerify: skipVerify ? "true" : "false",
            mapping: JSON.stringify(workspaceMapping),
            cellAdmin: cellAdmin
        }
    }];
}

function getWorkspacesAction(state, onLocalUpdate) {
    var workspaceCreate = state.workspaceCreate;
    var localStatus = state.localStatus;

    Object.keys(workspaceCreate).forEach(function (k) {
        workspaceCreate[k].save().then(function () {
            onLocalUpdate(T('createws.success').replace('%s', workspaceCreate[k].getModel().Label));
        })["catch"](function (e) {
            onLocalUpdate(T('createws.fail').replace('%1', workspaceCreate[k].getModel().Label).replace('%2', e.message));
        });
    });
    return [];
}

function getWorkspacesSummary(state) {
    var workspaceMapping = state.workspaceMapping;
    var _state$workspaceCreate = state.workspaceCreate;
    var workspaceCreate = _state$workspaceCreate === undefined ? {} : _state$workspaceCreate;

    return React.createElement(
        "div",
        null,
        T('createws.summary'),
        Object.keys(workspaceMapping).length > 0 && React.createElement(
            "table",
            { style: { width: 400, marginTop: 6 } },
            React.createElement(
                "tr",
                null,
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.pydio')
                ),
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.cells')
                ),
                React.createElement(
                    "td",
                    { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                    T('createws.head.status')
                )
            ),
            Object.keys(workspaceMapping).map(function (k) {
                return React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        k
                    ),
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        workspaceMapping[k]
                    ),
                    React.createElement(
                        "td",
                        { style: { padding: '2px 4px' } },
                        workspaceCreate[k] ? T('createws.notexists') : T('createws.exists')
                    )
                );
            })
        )
    );
}

function getSharesAction(state, onLocalUpdate) {
    var cellAdmin = state.cellAdmin;
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var workspaceMapping = state.workspaceMapping;
    var sharesFeatures = state.sharesFeatures;

    return [{
        name: "actions.etl.shares",
        params: _extends({
            left: "pydio8",
            right: "cells-local",
            mapping: JSON.stringify(workspaceMapping),
            url: url,
            user: user,
            cellAdmin: cellAdmin,
            skipVerify: skipVerify ? "true" : "false",
            password: pwd
        }, sharesFeatures)
    }];
}

function getSharesSummary(state) {
    var sharesFeatures = state.sharesFeatures;

    return React.createElement(
        "div",
        null,
        sharesFeatures && sharesFeatures.shareType && React.createElement(
            "div",
            null,
            sharesFeatures.shareType === 'LINK' ? T('share.linksonly') : T('share.cellsonly'),
            "."
        ),
        (!sharesFeatures || !sharesFeatures.shareType) && React.createElement(
            "div",
            null,
            T('share.all')
        ),
        sharesFeatures && sharesFeatures.ownerId && React.createElement(
            "div",
            null,
            T('share.user').replace('%s', sharesFeatures.ownerId)
        )
    );
}

function getMetadataAction(state, onLocalUpdate) {
    var url = state.url;
    var user = state.user;
    var pwd = state.pwd;
    var skipVerify = state.skipVerify;
    var workspaceMapping = state.workspaceMapping;
    var metadataFeatures = state.metadataFeatures;
    var metadataMapping = state.metadataMapping;
    var metadataCreate = state.metadataCreate;

    var global = metadataFeatures.indexOf('watches') > -1 || metadataFeatures.indexOf('bookmarks') > -1;
    var files = metadataFeatures.indexOf('filesMeta') > -1;
    var filesAction = undefined,
        globalAction = undefined;
    var actions = [];
    if (global) {
        globalAction = {
            name: "actions.etl.p8-global-meta",
            params: {
                url: url, user: user, password: pwd,
                skipVerify: skipVerify ? "true" : "false",
                mapping: JSON.stringify(workspaceMapping)
            }
        };
        actions.push(globalAction);
    }
    if (files) {
        filesAction = {
            name: "actions.etl.p8-legacy-meta",
            params: {
                metaMapping: JSON.stringify(metadataMapping)
            }
        };
        actions.push(filesAction);
    }
    if (metadataCreate.length) {
        var api = new _pydioHttpRestApi.UserMetaServiceApi(_pydioHttpApi2["default"].getRestClient());
        var request = new _pydioHttpRestApi.IdmUpdateUserMetaNamespaceRequest();
        request.Operation = _pydioHttpRestApi.UpdateUserMetaNamespaceRequestUserMetaNsOp.constructFromObject('PUT');
        request.Namespaces = metadataCreate;
        api.updateUserMetaNamespace(request).then(function (res) {
            onLocalUpdate(T('meta.success'));
        })["catch"](function (e) {
            onLocalUpdate(T('meta.fail').replace('%s', e.message));
        });
    }

    return actions;
}

function getMedataSummary(state) {
    var metadataFeatures = state.metadataFeatures;
    var metadataMapping = state.metadataMapping;

    return React.createElement(
        "div",
        null,
        metadataFeatures && React.createElement(
            "div",
            null,
            T('meta.summary'),
            " ",
            metadataFeatures.join(', ')
        ),
        metadataMapping && React.createElement(
            "div",
            null,
            T('meta.files'),
            React.createElement(
                "table",
                { style: { width: 400, marginTop: 6 } },
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "td",
                        { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                        T('createws.head.pydio')
                    ),
                    React.createElement(
                        "td",
                        { style: { backgroundColor: '#f5f5f5', padding: '2px 4px' } },
                        T('createws.head.cells')
                    )
                ),
                Object.keys(metadataMapping).map(function (k) {
                    return React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "td",
                            { style: { padding: '2px 4px' } },
                            k
                        ),
                        React.createElement(
                            "td",
                            { style: { padding: '2px 4px' } },
                            metadataMapping[k]
                        )
                    );
                })
            )
        )
    );
}
